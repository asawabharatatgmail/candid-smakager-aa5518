

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Quiz, UserRole, QuizType, FlashcardSet, Lead, LeadStatus, AcademicClass, Teacher, Subject, AiSchedulerRule, ScheduleEvent, GameLevel } from '../types';
import { 
    CLASS_ADMIN_HELP_CONTEXT,
    STUDENT_HELP_CONTEXT,
    TEACHER_HELP_CONTEXT,
    PARENT_HELP_CONTEXT,
    PRODUCT_OWNER_HELP_CONTEXT,
    BRANCH_ADMIN_HELP_CONTEXT,
} from '../data/helpContext';

if (!process.env.API_KEY) {
    // This warning is for development; in a real production build, this might be handled differently.
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "DISABLED" });

const quizSchema = (quizType: QuizType) => ({
    type: Type.OBJECT,
    properties: {
        quizTitle: {
            type: Type.STRING,
            description: "A creative and relevant title for the quiz based on the topic."
        },
        questions: {
            type: Type.ARRAY,
            description: `An array of ${quizType} questions.`,
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: {
                        type: Type.STRING,
                        description: `The text of the ${quizType} question.`
                    },
                    options: {
                        type: Type.ARRAY,
                        description: `An array of ${quizType === QuizType.MCQ ? '4' : '2'} possible answers (e.g., ["True", "False"]).`,
                        items: { type: Type.STRING }
                    },
                    correctAnswerIndex: {
                        type: Type.INTEGER,
                        description: "The 0-based index of the correct answer in the 'options' array."
                    }
                },
                required: ["questionText", "options", "correctAnswerIndex"]
            }
        }
    },
    required: ["quizTitle", "questions"]
});

const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A relevant title for the flashcard set based on the topic."
        },
        flashcards: {
            type: Type.ARRAY,
            description: "An array of flashcards, each with a front (term/question) and back (definition/answer).",
            items: {
                type: Type.OBJECT,
                properties: {
                    front: { type: Type.STRING, description: "The term, concept, or question on the front of the card." },
                    back: { type: Type.STRING, description: "The definition or answer on the back of the card." }
                },
                required: ["front", "back"]
            }
        }
    },
    required: ["title", "flashcards"]
};

const studyMaterialSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A clear and concise title for the study material."
        },
        content: {
            type: Type.STRING,
            description: "The main body of the study material, formatted as a single string with markdown for headings (#, ##), bullet points (*), and bold text (**). The content should be well-structured and easy to read."
        }
    },
    required: ["title", "content"]
};

const scheduleSchema = {
    type: Type.ARRAY,
    description: "An array of schedule event objects.",
    items: {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.STRING, description: "The day of the week for the event (e.g., 'Monday', 'Tuesday')." },
            startTime: { type: Type.STRING, description: "The start time of the lecture in HH:MM format (e.g., '09:00')." },
            endTime: { type: Type.STRING, description: "The end time of the lecture in HH:MM format (e.g., '10:00')." },
            classId: { type: Type.STRING, description: "The ID of the class." },
            subjectId: { type: Type.STRING, description: "The ID of the subject." },
            teacherId: { type: Type.STRING, description: "The ID of the teacher assigned to the lecture." },
        },
        required: ["day", "startTime", "endTime", "classId", "subjectId", "teacherId"]
    }
};

const emailSchema = {
    type: Type.OBJECT,
    properties: {
        subject: {
            type: Type.STRING,
            description: "A concise and professional email subject line."
        },
        body: {
            type: Type.STRING,
            description: "The full email body content, formatted as a single string with line breaks (\\n) for paragraphs. It should be professional, friendly, and address the lead by name."
        }
    },
    required: ["subject", "body"]
};

const leadAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: {
            type: Type.STRING,
            description: "A brief, 1-2 sentence overview of the current lead situation."
        },
        statusBreakdown: {
            type: Type.ARRAY,
            description: "An array of objects, one for each lead status, with count and percentage.",
            items: {
                type: Type.OBJECT,
                properties: {
                    status: { type: Type.STRING, enum: Object.values(LeadStatus) },
                    count: { type: Type.INTEGER },
                    percentage: { type: Type.NUMBER, description: "Percentage of total leads for this status." }
                },
                required: ["status", "count", "percentage"]
            }
        },
        conversionRate: {
            type: Type.NUMBER,
            description: "The conversion rate from 'New' leads to 'Qualified' leads, as a percentage. This should be (Qualified / Total Leads) * 100."
        },
        topPerformingSource: {
            type: Type.OBJECT,
            description: "Details about the best performing lead source, based on number of 'Qualified' leads.",
            properties: {
                source: { type: Type.STRING },
                qualifiedLeads: { type: Type.INTEGER },
                comment: { type: Type.STRING, description: "A brief comment on why this source is effective." }
            },
            required: ["source", "qualifiedLeads", "comment"]
        },
        actionableSuggestions: {
            type: Type.ARRAY,
            description: "An array of 2-3 specific, actionable suggestions for the sales team.",
            items: { type: Type.STRING }
        },
        keyHighlight: {
            type: Type.STRING,
            description: "A single, important highlight or insight from the data (e.g., 'A recent surge in 'Referral' leads indicates a successful campaign')."
        }
    },
    required: ["overallSummary", "statusBreakdown", "conversionRate", "topPerformingSource", "actionableSuggestions", "keyHighlight"]
};

const gameLevelsSchema = {
    type: Type.ARRAY,
    description: "An array of game levels, where each level contains multiple choice questions. The difficulty should increase with each level.",
    items: {
        type: Type.OBJECT,
        properties: {
            levelNumber: { type: Type.INTEGER, description: "The number of the level, starting from 1." },
            questions: {
                type: Type.ARRAY,
                description: "An array of multiple choice questions for this level.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        questionText: { type: Type.STRING, description: "The text of the MCQ question." },
                        options: { type: Type.ARRAY, description: "An array of exactly 4 possible answers.", items: { type: Type.STRING } },
                        correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the 'options' array." }
                    },
                    required: ["questionText", "options", "correctAnswerIndex"]
                }
            }
        },
        required: ["levelNumber", "questions"]
    }
};

const googleAppsScriptSchema = {
    type: Type.OBJECT,
    properties: {
        "Code.gs": {
            type: Type.STRING,
            description: "The Google Apps Script code for the backend (doGet and doPost functions)."
        },
        "Index.html": {
            type: Type.STRING,
            description: "The HTML code for the web form, including basic styling."
        }
    },
    required: ["Code.gs", "Index.html"]
};

export const generateLeadFormScript = async (fields: string[]): Promise<{ "Code.gs": string; "Index.html": string; } | null> => {
    if (process.env.API_KEY === 'DISABLED') return null;

    const prompt = `Generate Google Apps Script code for a web-based lead capture form.
    The form should be deployed as a web app and submit data to a Google Sheet named "Leads".
    The form needs to collect the following fields: ${fields.join(', ')}.
    
    Provide two pieces of code:
    1.  'Code.gs': The backend script with doGet to serve the HTML and doPost to handle form submission and append a row to the "Leads" sheet. Include a header row in the sheet if it doesn't exist.
    2.  'Index.html': The HTML for the form. Use basic, clean CSS for styling. Include a success message display after submission.

    Return the response in JSON format according to the schema.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: googleAppsScriptSchema,
            },
        });

        const jsonText = response.text.trim();
        const scriptData = JSON.parse(jsonText);
        return scriptData;
    } catch (error) {
        console.error("Failed to generate lead form script:", error);
        throw new Error("AI failed to generate lead form script.");
    }
};


export const generateEmailForLead = async (
  lead: Lead,
  purpose: string
): Promise<{ subject: string; body: string } | null> => {
  if (process.env.API_KEY === 'DISABLED') return null;

  try {
    const prompt = `Generate a professional and friendly email for a sales lead for our educational institute.

    Lead Details:
    - Name: ${lead.name}
    - Email: ${lead.email}
    - Status: ${lead.status}
    
    Purpose of this email: ${purpose}.

    The tone should be encouraging and helpful. The goal is to move the lead to the next stage. Address the lead by their first name.
    
    Generate the email content based on the provided schema.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: emailSchema,
        },
    });

    const jsonText = response.text.trim();
    const emailData = JSON.parse(jsonText);

    if (emailData && emailData.subject && emailData.body) {
      return emailData;
    } else {
      throw new Error("Invalid email format received from AI.");
    }
  } catch (error) {
    throw new Error("Failed to generate email. The AI may be experiencing issues.");
  }
};

export const generateSchedule = async (
    classes: AcademicClass[],
    teachers: Teacher[],
    subjects: Subject[],
    rules: AiSchedulerRule[]
): Promise<Omit<ScheduleEvent, 'id'>[] | null> => {
    if (process.env.API_KEY === 'DISABLED') return null;
    
    const rulesString = rules.map(rule => {
        const subject = subjects.find(s => s.id === rule.subjectId);
        return `- ${subject?.name || 'Unknown Subject'}: ${rule.lecturesPerWeek} lectures per week.`;
    }).join('\n');

    const prompt = `You are an expert school scheduler. Create a weekly class schedule for the provided classes, subjects, and teachers.
    
    Schedule lectures from Monday to Friday, between 09:00 and 16:00. Each lecture is exactly 1 hour long.
    The lunch break is strictly from 12:00 to 13:00, no lectures can be scheduled during this time.

    Available Resources:
    Classes: ${JSON.stringify(classes.map(c => ({id: c.id, name: c.name})))}
    Teachers & The Subjects They Can Teach: ${JSON.stringify(teachers.map(t => ({id: t.id, name: t.name, subjectIds: t.subjectIds})))}
    Subjects: ${JSON.stringify(subjects.map(s => ({id: s.id, name: s.name})))}

    Rules to follow for lecture allocation:
    ${rulesString}

    Hard Constraints:
    - A teacher can only teach one class at a time.
    - A class can only have one lecture at a time.
    - A teacher must be assigned to a subject they are qualified to teach (as per the 'subjectIds' in the teacher data).

    Soft Constraints (try your best to follow):
    - Avoid scheduling the same subject back-to-back for the same class.
    - Distribute lectures for a single subject evenly throughout the week, not all on one day.
    - Try to give teachers and classes at least one free period per day if possible, besides lunch.

    Generate the final schedule as a JSON array based on the provided schema. Ensure every lecture specified in the rules is scheduled.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: scheduleSchema,
                temperature: 0.3
            },
        });

        const jsonText = response.text.trim();
        const scheduleData = JSON.parse(jsonText);

        if (Array.isArray(scheduleData)) {
            return scheduleData;
        } else {
            throw new Error("Invalid schedule format received from AI.");
        }
    } catch (error) {
        throw new Error("Failed to generate schedule. The AI may be experiencing issues or the request is too complex.");
    }
};


export const generateLeadSummary = async (leads: Lead[]): Promise<any | null> => {
  if (process.env.API_KEY === 'DISABLED' || leads.length === 0) {
    return null;
  }

  const leadsDataString = leads.map(l => `Status: ${l.status}, Source: ${l.source}, Date: ${l.addedDate}`).join('; ');

  const prompt = `You are an expert CRM analyst for an educational institute. Based on the following raw lead data, provide a detailed analysis. Calculate percentages based on the total number of leads.

Lead Data: ${leadsDataString}
Total Leads: ${leads.length}

Provide a detailed analysis in JSON format according to the provided schema. Focus on conversions, highlights, and actionable suggestions.
- For statusBreakdown, provide an entry for each status: New, Contacted, Qualified, Lost. The percentage for each status should be (count / total leads) * 100.
- For conversionRate, calculate the percentage of 'Qualified' leads from the total. This is (number of qualified leads / total leads) * 100.
- For topPerformingSource, identify the source with the most 'Qualified' leads.
- For actionableSuggestions, give concrete advice.
- For keyHighlight, find the most interesting pattern or trend in the data.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: leadAnalysisSchema,
            temperature: 0.3
        }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Could not generate lead analysis. The AI service may be temporarily unavailable.");
  }
};


export const generateMcqQuiz = async (topic: string, numQuestions: number, difficulty: string, quizType: QuizType): Promise<Omit<Quiz, 'id' | 'quizType'> | null> => {
    if (process.env.API_KEY === "DISABLED") return null;
    try {
        const prompt = `Generate a ${quizType} quiz with ${numQuestions} questions on the topic "${topic}". The difficulty level should be ${difficulty}. ${quizType === QuizType.MCQ ? 'Each question must have exactly 4 options.' : 'Each question should be a True/False statement.'}`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema(quizType),
            },
        });

        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);
        
        if (quizData && Array.isArray(quizData.questions)) {
            return quizData;
        } else {
            throw new Error("Invalid quiz format received from AI.");
        }

    } catch (error) {
        throw new Error("Failed to generate quiz. The AI may be experiencing issues.");
    }
};

export const generateFlashcards = async (topic: string, numFlashcards: number): Promise<Omit<FlashcardSet, 'id'> | null> => {
    if (process.env.API_KEY === "DISABLED") return null;
    try {
        const prompt = `Generate a set of ${numFlashcards} educational flashcards on the topic "${topic}". Each flashcard should have a 'front' (a term or question) and a 'back' (a definition or answer).`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            },
        });

        const jsonText = response.text.trim();
        const flashcardData = JSON.parse(jsonText);
        
        if (flashcardData && Array.isArray(flashcardData.flashcards)) {
            return flashcardData;
        } else {
            throw new Error("Invalid flashcard format received from AI.");
        }

    } catch (error) {
        throw new Error("Failed to generate flashcards. The AI may be experiencing issues.");
    }
};

export const generateStudyMaterial = async (
  topic: string,
  gradeLevel: string,
  difficulty: string
): Promise<{ title: string; content: string } | null> => {
  if (process.env.API_KEY === 'DISABLED') return null;

  try {
    const prompt = `Generate a detailed study guide on the topic "${topic}" suitable for a ${gradeLevel} student. The difficulty level should be ${difficulty}. The output must be well-structured, using markdown for formatting. Include a main title, several subheadings, and use bullet points for lists and key information.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: studyMaterialSchema,
        },
    });

    const jsonText = response.text.trim();
    const materialData = JSON.parse(jsonText);

    if (materialData && materialData.title && materialData.content) {
      return materialData;
    } else {
      throw new Error("Invalid study material format received from AI.");
    }
  } catch (error) {
    throw new Error("Failed to generate study material. The AI may be experiencing issues.");
  }
};

export const findEducationalVideos = async (topic: string, gradeLevel: string): Promise<{ title: string; url: string }[] | null> => {
    if (process.env.API_KEY === 'DISABLED') return null;

    const prompt = `Search for 5 highly-rated, educational YouTube videos about "${topic}" suitable for ${gradeLevel} students.
    Provide the response as a JSON array of objects. Each object must have two keys: "title" (the video title) and "url" (the full YouTube video URL).
    Do not include any other text, just the JSON array.
    Example format:
    [
        {"title": "Example Video Title 1", "url": "https://www.youtube.com/watch?v=xxxx"},
        {"title": "Example Video Title 2", "url": "https://www.youtube.com/watch?v=yyyy"}
    ]`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        // Try to find a JSON array within the response text
        const match = jsonText.match(/(\[[\s\S]*\])/);
        if (match && match[1]) {
            const videoData = JSON.parse(match[1]);
            if (Array.isArray(videoData)) {
                return videoData.filter(v => v.title && v.url && v.url.includes('youtube.com'));
            }
        }
        throw new Error("AI did not return a valid JSON array of videos.");

    } catch (error) {
        console.error("Failed to find educational videos:", error);
        throw new Error("Failed to find videos using AI. The service may be experiencing issues or could not find relevant content.");
    }
};


export const generateQuote = async (): Promise<string> => {
    if (process.env.API_KEY === "DISABLED") return "AI features disabled. Set API_KEY.";
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate a short, unique, and inspirational 'thought of the day' for a student. Include the attributed author if known, otherwise attribute it to 'Anonymous'. Format it as: 'The quote.' - Author",
            config: {
                temperature: 1,
            }
        });
        return response.text;
    } catch (error) {
        return "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela";
    }
};

export const generatePersonalizedInsight = async (role: UserRole): Promise<string> => {
    if (process.env.API_KEY === "DISABLED") return "AI features disabled. Set API_KEY.";

    let prompt = "";
    switch (role) {
        case UserRole.Teacher:
            prompt = "You are an expert instructional designer. Provide a short, actionable tip (2-3 sentences) for a teacher using an online platform. Suggest a creative way to use either quizzes or flashcards to reinforce a complex topic, like a concept from science or history. The tone should be encouraging and professional.";
            break;
        case UserRole.Student:
            prompt = "You are a friendly study coach. Provide a short, motivational study tip (2-3 sentences) for a student. Suggest a specific, effective study technique, like the Feynman technique or spaced repetition, and briefly explain how to apply it to their subjects. The tone should be encouraging and positive.";
            break;
        case UserRole.ClassAdmin:
        case UserRole.BranchAdmin:
            prompt = "You are a strategic educational consultant. Provide a short, insightful suggestion (2-3 sentences) for an administrator on using data to improve student outcomes. Suggest looking at attendance records or quiz performance to identify at-risk students. The tone should be insightful and professional.";
            break;
        case UserRole.Parent:
            prompt = "You are a helpful AI assistant for parents. Provide a short, supportive tip (2-3 sentences) for a parent on how to engage with their child about their schoolwork. Suggest a positive conversation starter about their recent learnings or an upcoming assignment on the platform. The tone should be friendly and constructive.";
            break;
        default:
            return "A great day for learning and administration!";
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });
        return response.text;
    } catch (error) {
        return "Focus on collaboration to enhance the learning experience for everyone.";
    }
};

export const generateGameLevels = async (topic: string, numLevels: number, questionsPerLevel: number): Promise<GameLevel[] | null> => {
    if (process.env.API_KEY === "DISABLED") return null;

    try {
        const prompt = `Generate a gamified challenge with ${numLevels} levels about the topic "${topic}". Each level should contain exactly ${questionsPerLevel} multiple-choice questions. The difficulty must increase progressively from level 1 to level ${numLevels}. For each question, provide 4 options and the index of the correct one.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: gameLevelsSchema,
            },
        });

        const jsonText = response.text.trim();
        const gameData = JSON.parse(jsonText);
        
        if (Array.isArray(gameData)) {
            return gameData as GameLevel[];
        } else {
            throw new Error("Invalid game format received from AI.");
        }

    } catch (error) {
        throw new Error("Failed to generate game. The AI may be experiencing issues.");
    }
};

export const getAiHelpResponse = async (query: string, role: UserRole) => {
    if (process.env.API_KEY === 'DISABLED') {
        throw new Error("AI features disabled. Set API_KEY.");
    }
    
    let context = '';
    switch (role) {
        case UserRole.ClassAdmin:
            context = CLASS_ADMIN_HELP_CONTEXT;
            break;
        case UserRole.Student:
            context = STUDENT_HELP_CONTEXT;
            break;
        case UserRole.Teacher:
            context = TEACHER_HELP_CONTEXT;
            break;
        case UserRole.Parent:
            context = PARENT_HELP_CONTEXT;
            break;
        case UserRole.ProductOwner:
            context = PRODUCT_OWNER_HELP_CONTEXT;
            break;
        case UserRole.BranchAdmin:
            context = BRANCH_ADMIN_HELP_CONTEXT;
            break;
        default:
            context = 'You are a helpful assistant for an educational platform.';
    }

    const systemInstruction = `You are an AI assistant for the SAAA educational platform. Your role is to help users understand and use the platform's features. Answer questions based ONLY on the provided context document. Be concise and helpful. Format your answers using markdown for readability. If the question is outside the scope of the provided context, politely state that you can only answer questions about the platform's features.
    
    --- CONTEXT DOCUMENT ---
    ${context}
    --- END OF CONTEXT ---
    
    Now, answer the user's question.`;

    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: query,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response;
    } catch (error) {
        console.error("AI Help Error:", error);
        throw new Error("Failed to get a response from the AI assistant.");
    }
};

export const getAiTutorResponse = async (query: string, subject: string) => {
    if (process.env.API_KEY === 'DISABLED') {
        throw new Error("AI features disabled. Set API_KEY.");
    }
    
    const systemInstruction = `You are an expert AI tutor for the subject: ${subject}. Your name is Veda.
    Your goal is to help students understand concepts, not just give them answers.
    - Be encouraging, friendly, and patient.
    - Explain concepts clearly and concisely, using examples and analogies relevant to a high school student.
    - After explaining something, ask a follow-up question to check for understanding.
    - If a student asks for a direct answer to a homework problem, guide them through the steps to solve it themselves instead of giving the answer away.
    - Keep your responses structured and easy to read using markdown.
    - Your knowledge is limited to the subject of ${subject}. If asked about other subjects or topics, politely state that you can only help with ${subject}.`;

    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: query,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response;
    } catch (error) {
        console.error("AI Tutor Error:", error);
        throw new Error("Failed to get a response from the AI tutor.");
    }
};

export const summarizeNote = async (noteContent: string): Promise<string> => {
    if (process.env.API_KEY === "DISABLED") return "AI features are disabled.";
    const prompt = `Summarize the following text into key points using markdown bullet points:\n\n---\n\n${noteContent}`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        throw new Error("Failed to summarize note.");
    }
};

export const generateQuestionsFromNote = async (noteContent: string): Promise<string> => {
    if (process.env.API_KEY === "DISABLED") return "AI features are disabled.";
    const prompt = `Based on the following text, generate 3-5 study questions to test understanding. Format them as a numbered markdown list:\n\n---\n\n${noteContent}`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        throw new Error("Failed to generate questions.");
    }
};

export const explainText = async (text: string): Promise<string> => {
    if (process.env.API_KEY === "DISABLED") return "AI features are disabled.";
    const prompt = `Explain the following concept or term in a simple and concise way, as if explaining to a high school student. Use markdown for formatting if needed:\n\n---\n\n"${text}"`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        throw new Error("Failed to explain text.");
    }
};
