import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdmin } from "../../../../lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import removeMd from "remove-markdown";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const pdfParse = require("pdf-parse/lib/pdf-parse");

    const data = await pdfParse(buffer, {
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    });

    return data.text;
  } catch (error) {
    if (
      error.message.includes("ENOENT") ||
      error.message.includes("no such file")
    ) {
      throw new Error(
        "PDF parsing issue detected. Please copy and paste the text content into the text field instead."
      );
    }

    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

// Pay standardization function
const standardizePay = (payInfo) => {
  if (!payInfo || payInfo === "Not Available") return "Not Available";

  const numMatch = payInfo.toString().match(/[\d,]+/);
  if (numMatch) {
    const amount = numMatch[0].replace(/,/g, "");
    return `₹${amount} per month`;
  }

  return payInfo;
};

// Enhanced data validation and standardization function
const validateAndStandardizeData = (parsedData, originalText) => {
  // Process deadlines with better validation
  let processedDeadlines = [];
  if (Array.isArray(parsedData.deadlines)) {
    processedDeadlines = parsedData.deadlines
      .filter((deadline) => deadline && (deadline.date || deadline.type))
      .map((deadline) => ({
        type: deadline.type || "Important Date",
        date: deadline.date || "",
        time: deadline.time || "23:59",
        description: deadline.description || "",
      }));
  }

  // Process apply links with better validation
  let processedApplyLinks = [];
  if (Array.isArray(parsedData.applyLinks)) {
    processedApplyLinks = parsedData.applyLinks
      .filter((link) => link && link.url)
      .slice(0, 2)
      .map((link) => ({
        title: link.title || "Apply Here",
        url: link.url,
      }));
  }

  return {
    name: parsedData.name || "Not Available",
    role: parsedData.role || "Not Available",
    location: parsedData.location || "Not Available",
    duration: parsedData.duration || "Not Available",
    cgpaCriteria: parsedData.cgpaCriteria
      ? parseFloat(parsedData.cgpaCriteria)
      : null,
    backlogsAllowed: parsedData.backlogsAllowed !== undefined  // ADDED BACKLOGS FIELD
      ? parseInt(parsedData.backlogsAllowed) 
      : null,
    pay: standardizePay(parsedData.pay),
    branchesEligible: Array.isArray(parsedData.branchesEligible)
      ? parsedData.branchesEligible
      : [],
    companyInfo: parsedData.companyInfo || "Not Available",
    roleInfo: parsedData.roleInfo || "Not Available",
    deadlines: processedDeadlines,
    applyLinks: processedApplyLinks,
  };
};

// Process with Gemini 2.5 Flash
async function processWithGemini(text) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Extract company information from this job posting and return ONLY a valid JSON object with these exact fields:

{
  "name": "Company name",
  "role": "Job role/position title",
  "location": "Job location",
  "duration": "Internship/job duration", 
  "cgpaCriteria": 6.5,
  "backlogsAllowed": 2,
  "pay": "Monthly salary amount",
  "branchesEligible": ["CSE", "ECE"], // Use branch codes only
  "companyInfo": "Company description and other important details",
  "roleInfo": "Role responsibilities, requirements, and application process",
  "deadlines": [
    {
      "type": "Application Deadline",
      "date": "31-12-2024",
      "time": "23:59",
      "description": "Last date to apply"
    },
    {
      "type": "Interview Date",
      "date": "15-01-2025", 
      "time": "10:00",
      "description": "Interview round"
    }
  ],
  "applyLinks": [{"title": "Apply Here", "url": "https://company.com/apply"}]
}

EXTRACTION RULES:

NAME: Extract exact company name, avoid generic terms like "XYZ Corp"

ROLE: Full position title as mentioned (e.g., "Software Development Engineer Intern")

LOCATION: City/State or "Remote" or "Hybrid" as specified

DURATION: Extract internship/job duration (e.g., "6 months", "3 months", "Full-time"). If not mentioned, use "Not Available"

CGPA: Extract minimum CGPA as number only (e.g., 6.5, 7.0). Use null if not mentioned

BACKLOGS: Extract maximum number of backlogs allowed as number only (e.g., 0, 1, 2). Use null if not mentioned or not specified

PAY: 
- Extract monthly amount as number with currency (e.g., "₹50,000 per month", "₹75K monthly")
- If annual package given, convert to monthly (divide by 12)
- If stipend mentioned, use stipend amount
- If range given, use the average or mention range
- If not mentioned, use "Not Available"

BRANCHES:
- Return only abbreviations of eligible branches based on the list below
- If "all branches" or equivalent is mentioned, return all the codes below
- If not specified, use empty array []

Valid branch abbreviations:
[
  "AAE", "AE", "BME", "BT", "CHE", "CE", "CCE", "CSE", "CSE-AIML", "CSFT",
  "CPS", "DSE", "EEE", "ECE", "ENI", "ECE-VLSI", "IE", "IT", "MNC", "ME", "MTE"
]

COMPANY INFO: Include company background, business domain, size, culture, benefits, and any other important company details not covered by other fields

ROLE INFO: Include role responsibilities, required skills, technologies, qualifications, selection process, training details, and work environment

DURATION:
- Extract internship/job duration (e.g., "6 months", "3 months", "Full-time")
- If not mentioned, try to infer from context (e.g., "Summer Internship", "Winter Internship", "Final year internship")
- If nothing can be inferred, use "Not Available"

DEADLINES - VERY IMPORTANT: Extract ALL dates mentioned in the job posting as separate deadline objects:
- Application deadline/last date to apply
- Registration deadline  
- Interview dates
- Joining date/start date
- Document submission deadline
- Any other important dates

For EACH deadline, create an object with:
- "type": Brief description (e.g., "Application Deadline", "Interview Date", "Joining Date")
- "date": DD-MM-YYYY format (e.g., "31-12-2024", "15-01-2025")
- "time": HH:MM format in 24-hour (e.g., "23:59", "10:00") - use "23:59" if no specific time mentioned
- "description": Additional details about this deadline

- Sort the deadlines array so that the earliest date comes first and latest is last.

APPLY LINKS: Extract application URLs (maximum 2):
- Company career page
- Application portal
- Registration link
Format: [{"title": "Portal Name or 'Apply Here'", "url": "https://complete-url"}]

DATE AND TIME FORMATTING RULES:
- ALL dates must be in DD-MM-YYYY format (day-month-year)
- Examples: "31-12-2024", "15-01-2025", "05-03-2024"
- ALL times must be in HH:MM format (24-hour)
- Examples: "23:59", "17:30", "09:00"
- If only date is mentioned, use "23:59" as default time
- If "by end of day" mentioned, use "23:59"
- If morning mentioned, use "09:00"
- If afternoon/evening mentioned, use "17:00"

IMPORTANT:
- ALWAYS include deadlines array even if no dates found (use empty array [])
- Use "Not Available" for missing information, never leave fields empty
- Include relevant keywords and technologies in roleInfo
- Put any other important details not covered by specific fields into companyInfo
- Return only valid JSON, no markdown formatting
- Ensure all URLs are complete and clickable

Job posting content:
${text}

JSON Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error("No content returned from Gemini");
    }

    // Extract JSON from response using removeMd
    let jsonText = removeMd(responseText).trim();

    // Find JSON object boundaries
    const jsonStart = jsonText.indexOf("{");
    const jsonEnd = jsonText.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }

    try {
      const parsedData = JSON.parse(jsonText);
      const standardizedData = validateAndStandardizeData(parsedData, text);
      return standardizedData;
    } catch (parseError) {
      return {
        name: "AI Extracted Company",
        role: "AI Extracted Role",
        location: "Not Available",
        duration: "Not Available",
        cgpaCriteria: null,
        backlogsAllowed: null, // ADDED BACKLOGS FALLBACK
        pay: "Not Available",
        branchesEligible: [],
        companyInfo: text.substring(0, 200) + "...",
        roleInfo: text.substring(0, 500) + "...",
        deadlines: [
          {
            type: "Extraction Failed",
            date: "",
            time: "23:59",
            description: "Please add deadlines manually",
          },
        ],
        applyLinks: [],
      };
    }
  } catch (error) {
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Extract API working with Gemini 2.5 Flash",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    status: "operational",
  });
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const textInput = formData.get("text");

    let contentToSend = "";

    // Handle PDF
    if (file && file.size > 0) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF files are supported" },
          { status: 400 }
        );
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const pdfText = await extractTextFromPDF(buffer);

        if (pdfText && pdfText.trim().length > 0) {
          contentToSend += pdfText + "\n\n";
        }
      } catch (pdfError) {
        return NextResponse.json(
          { error: `PDF processing failed: ${pdfError.message}` },
          { status: 400 }
        );
      }
    }

    // Handle text input
    if (textInput && textInput.trim().length > 0) {
      contentToSend += textInput.trim();
    }

    // Validate content
    if (!contentToSend || contentToSend.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "Please provide a PDF file or text input with at least 10 characters",
        },
        { status: 400 }
      );
    }

    // Send to Gemini 2.5 Flash
    const companyData = await processWithGemini(contentToSend);

    return NextResponse.json({
      success: true,
      data: companyData,
      extractedText:
        contentToSend.substring(0, 500) +
        (contentToSend.length > 500 ? "..." : ""),
      textLength: contentToSend.length,
      model: "gemini-2.5-flash",
      sources: {
        hasPdf: !!file,
        hasText: !!textInput,
      },
      stats: {
        deadlinesFound: companyData.deadlines?.length || 0,
        applyLinksFound: companyData.applyLinks?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Processing failed: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
