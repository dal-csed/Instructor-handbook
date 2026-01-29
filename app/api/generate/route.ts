import { type NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

// Helper function to convert HTML to docx elements
function convertHtmlToDocx(html: string): Paragraph[] {
  if (!html || html.trim() === "") {
    return [new Paragraph({ text: "" })];
  }

  try {
    const paragraphs: Paragraph[] = [];

    // Remove contenteditable spans that Quill uses for bullet rendering
    const cleanedHtml = html
      .replace(/<span[^>]*class="ql-ui"[^>]*>.*?<\/span>/gi, "")
      .replace(/<span[^>]*contenteditable="false"[^>]*>.*?<\/span>/gi, "")
      .replace(/contenteditable="false"/gi, "")
      .trim();

    console.log("[v0] Cleaned HTML sample:", cleanedHtml.substring(0, 200));

    // Check if this is a list structure
    if (
      cleanedHtml.includes('data-list="bullet"') ||
      cleanedHtml.includes("<ul") ||
      cleanedHtml.includes("<li")
    ) {
      const listItemRegex = /<li[^>]*>(.*?)<\/li>/gi;
      let match;
      const listMatches: Array<{ indent: number; content: string }> = [];

      while ((match = listItemRegex.exec(cleanedHtml)) !== null) {
        const fullLi = match[0];
        const content = match[1];

        // Determine indentation level from ql-indent-X class
        let indentLevel = 0;
        const indentMatch = fullLi.match(/ql-indent-(\d+)/);
        if (indentMatch) {
          indentLevel = Number.parseInt(indentMatch[1], 10);
        }

        console.log(
          "[v0] List item found - indent:",
          indentLevel,
          "content:",
          content.substring(0, 50)
        );
        listMatches.push({ indent: indentLevel, content });
      }

      // If we found list items, process them
      if (listMatches.length > 0) {
        for (const item of listMatches) {
          const textRuns = parseInlineFormats(item.content);

          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: "• " }), ...textRuns],
              spacing: { before: 100, after: 100 },
              indent: {
                left: (item.indent + 1) * 360, // Base indent + additional indent per level (0.25 inch = 360 twips)
                hanging: 360, // Hanging indent for bullet
              },
            })
          );
        }
        console.log("[v0] Created", listMatches.length, "list items");
        return paragraphs;
      }
    }

    // Fallback to simpler parsing for non-list content
    const blocks = cleanedHtml
      .replace(/<\/p>/gi, "</p>\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .split("\n")
      .filter((block) => block.trim());

    for (const block of blocks) {
      // Check for headings
      if (block.match(/<h[1-6][^>]*>/i)) {
        const text = block.replace(/<[^>]*>/g, "").trim();
        paragraphs.push(
          new Paragraph({
            text: text,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );
      }
      // Regular paragraph
      else if (block.trim()) {
        const textRuns = parseInlineFormats(block);
        if (textRuns.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: textRuns,
              spacing: { before: 100, after: 100 },
            })
          );
        }
      }
    }

    return paragraphs.length > 0 ? paragraphs : [new Paragraph({ text: "" })];
  } catch (error) {
    console.error("[v0] Error converting HTML:", error);
    // Fallback to plain text
    const plainText = html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return [new Paragraph({ text: plainText })];
  }
}

function parseInlineFormats(html: string): TextRun[] {
  const textRuns: TextRun[] = [];

  // Remove paragraph tags but keep inline formatting
  const content = html
    .replace(/<span[^>]*class="ql-ui"[^>]*>.*?<\/span>/gi, "")
    .replace(/<span[^>]*contenteditable="false"[^>]*>.*?<\/span>/gi, "")
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<\/?ul[^>]*>/gi, "")
    .replace(/<\/?ol[^>]*>/gi, "")
    .trim();

  if (!content) return [];

  // Simple regex to find formatted text
  const pattern = /<(strong|b|em|i|u)[^>]*>(.*?)<\/\1>|([^<]+)/gi;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    if (match[1] && match[2]) {
      // Formatted text
      const tag = match[1].toLowerCase();
      const text = match[2]
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (text) {
        textRuns.push(
          new TextRun({
            text: text,
            bold: tag === "strong" || tag === "b",
            italics: tag === "em" || tag === "i",
            underline: tag === "u" ? {} : undefined,
          })
        );
      }
    } else if (match[3]) {
      // Plain text
      const text = match[3]
        .replace(/&nbsp;/g, " ")
        .replace(/<[^>]*>/g, "")
        .trim();
      if (text) {
        textRuns.push(new TextRun({ text: text }));
      }
    }
  }

  // If no matches, just add plain text
  if (textRuns.length === 0) {
    const plainText = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    if (plainText) {
      textRuns.push(new TextRun({ text: plainText }));
    }
  }

  return textRuns;
}

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] API route called");
    const data = await req.json();
    console.log("[v0] Received data keys:", Object.keys(data));

    const sections = [];

    // Title
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${data.course_number || "COURSE"} --- ${
              data.course_name || "Course Name"
            }`,
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "Course Syllabus",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    // Instructor Information Section
    if (
      data.instructor_name ||
      data.office ||
      data.email ||
      data.office_hours ||
      data.class_time ||
      data.classroom ||
      data.lab_time ||
      data.lab_room ||
      data.homepage
    ) {
      sections.push(
        new Paragraph({
          text: "Instructor Information",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        })
      );

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
            insideHorizontal: { style: BorderStyle.NONE, size: 0 },
            insideVertical: { style: BorderStyle.NONE, size: 0 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Instructor:", bold: true }),
                      ],
                    }),
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.instructor_name || "")],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Office:", bold: true })],
                    }),
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.office || "")],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "E-mail:", bold: true })],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.email || "")],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Office Hours:", bold: true }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.office_hours || "")],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Class Meeting Time:",
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.class_time || "")],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Room No:", bold: true })],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.classroom || "")],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Lab Meeting Time:", bold: true }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.lab_time || "")],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Room No:", bold: true })],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.lab_room || "")],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Course Homepage:", bold: true }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph(data.homepage || "")],
                  columnSpan: 3,
                  borders: {
                    top: { style: BorderStyle.NONE, size: 0 },
                    bottom: { style: BorderStyle.NONE, size: 0 },
                    left: { style: BorderStyle.NONE, size: 0 },
                    right: { style: BorderStyle.NONE, size: 0 },
                  },
                }),
              ],
            }),
          ],
        })
      );
    }

    sections.push(new Paragraph({ text: "", spacing: { after: 200 } }));

    // Teaching Assistants
    if (data.tas && data.tas.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Teaching Assistants: ", bold: true }),
            new TextRun(
              data.tas.map((ta: any) => `${ta.name} (${ta.email})`).join(", ")
            ),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Course Mail List
    if (data.course_mail_list) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Course Mail List: ", bold: true }),
            new TextRun(data.course_mail_list),
          ],
          spacing: { after: 400 },
        })
      );
    }

    // Important Dates - with formatting preserved
    if (data.important_dates) {
      sections.push(
        new Paragraph({
          text: "Important Dates",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const importantDatesContent = convertHtmlToDocx(data.important_dates);
      sections.push(...importantDatesContent);
    }

    // Course Description
    if (data.course_description) {
      sections.push(
        new Paragraph({
          text: "Course Description",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          text: data.course_description,
          spacing: { after: 120 },
        })
      );
    }

    // Learning Outcomes - with formatting preserved
    if (data.learning_outcomes) {
      sections.push(
        new Paragraph({
          text: "Learning Outcomes",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const learningOutcomesContent = convertHtmlToDocx(data.learning_outcomes);
      sections.push(...learningOutcomesContent);
    }

    // Course Rationale
    if (data.course_rationale) {
      sections.push(
        new Paragraph({
          text: "Course Rationale",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          text: data.course_rationale,
          spacing: { after: 120 },
        })
      );
    }

    // Class Format and Course Communication - with formatting preserved
    if (data.class_format) {
      sections.push(
        new Paragraph({
          text: "Class Format and Course Communication",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const classFormatContent = convertHtmlToDocx(data.class_format);
      sections.push(...classFormatContent);
    }

    // Evaluation Criteria
    if (data.evaluation_criteria && data.evaluation_criteria.length > 0) {
      sections.push(
        new Paragraph({
          text: "Evaluation Criteria",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );

      for (const item of data.evaluation_criteria) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${item.name}: `, bold: true }),
              new TextRun(item.percentage),
            ],
            spacing: { after: 60 },
          })
        );

        if (item.description) {
          const descContent = convertHtmlToDocx(item.description);
          sections.push(...descContent);
        }
      }
    }

    // Notes - with formatting preserved
    if (data.notes) {
      sections.push(
        new Paragraph({
          text: "Notes",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const notesContent = convertHtmlToDocx(data.notes);
      sections.push(...notesContent);
    }

    // Student Declaration of Absence
    if (data.student_declaration) {
      sections.push(
        new Paragraph({
          text: "Student Declaration of Absence",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          text: data.student_declaration,
          spacing: { after: 120 },
        })
      );
    }

    // Midterm and Final Exam Requirements - with formatting preserved
    if (data.exam_requirements) {
      sections.push(
        new Paragraph({
          text: "Midterm and Final Exam Requirements",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const examContent = convertHtmlToDocx(data.exam_requirements);
      sections.push(...examContent);
    }

    // Academic Standards - with formatting preserved
    if (data.academic_standards) {
      sections.push(
        new Paragraph({
          text: "Academic Standards",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const academicStandardsContent = convertHtmlToDocx(
        data.academic_standards
      );
      sections.push(...academicStandardsContent);
    }

    // Required Texts and Resources - with formatting preserved
    if (data.required_texts) {
      sections.push(
        new Paragraph({
          text: "Required Texts and Resources",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const textsContent = convertHtmlToDocx(data.required_texts);
      sections.push(...textsContent);
    }

    // Prerequisites
    if (data.prerequisites) {
      sections.push(
        new Paragraph({
          text: "Prerequisites",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          text: data.prerequisites,
          spacing: { after: 120 },
        })
      );
    }

    // Tentative List of Topics - with formatting preserved
    if (data.topics_list) {
      sections.push(
        new Paragraph({
          text: "Tentative List of Topics",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
      const topicsContent = convertHtmlToDocx(data.topics_list);
      sections.push(...topicsContent);
    }

    // Policies
    if (data.policies) {

      if (data.policies.speakUpPolicy) {
        sections.push(
          new Paragraph({
            text: "What We All Need to Do",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "1. Be Ready to Act:", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "This starts with promising yourself to speak up to help prevent it from happening again. Whatever it takes, summon your courage to address the issue. Try to approach the issue with open-ended questions like \"Why did you say that?\" or \"How did you develop that belief?\"",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "2. Identify the Behaviour:", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Use reflective listening and avoid labeling, name-calling, or assigning blame to the person. Focus the conversation on the behaviour, not on the person. For example, \"The comment you just made sounded racist, is that what you intended?\" is a better approach than \"You're a racist if you make comments like that.\"",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "3. Appeal to Principles:", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "This can work well if the person is known to you, like a friend, sibling, or co-worker. For example, \"I have always thought of you as a fair-minded person, so it shocks me when I hear you say something like that.\"",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "4. Set Limits:", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "You cannot control another person's actions, but you can control what happens in your space. Do not be afraid to ask someone \"Please do not tell racist jokes in my presence anymore\" or state \"This classroom is not a place where I allow homophobia to occur.\" After you have set that expectation, make sure you consistently maintain it.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "5. Find or be an Ally:", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Seek out like-minded people that support your views, and help support others in their challenges. Leading by example can be a powerful way to inspire others to do the same.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "6. Be Vigilant:", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Change can happen slowly, but do not let this deter you. Stay prepared, keep speaking up, and do not let yourself be silenced.",
            spacing: { after: 120 },
          })
        );
      }

      if (data.policies.cultureOfRespect) {
        sections.push(
          new Paragraph({
            text: "Culture of Respect",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: "Every person has a right to respect and safety. We believe inclusiveness is fundamental to education and learning. Misogyny and other disrespectful behaviour in our classrooms, on our campus, on social media, and in our community is unacceptable. As a community, we must stand for equality and hold ourselves to a higher standard.",
            spacing: { after: 120 },
          })
        );
      }

      if (data.policies.studentHealthWellness) {
        sections.push(
          new Paragraph({
            text: "Student Health and Wellness",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: "Taking care of your health is important. As a Dalhousie student, you have access to a wide range of resources to support your health and wellbeing. Students looking to access physical or mental health and wellness services at Dalhousie can go to the Student Health and Wellness Centre in the LeMarchant Building. The team includes: registered nurses, doctors, counsellors and a social worker. Visit Student Health and Wellness to learn more and book an appointment today. Students also have access to a variety of online mental health resources, including telephone/texting counselling and workshops/training programs. Learn more and access these resources at Mental Health Services.",
            spacing: { after: 120 },
          })
        );
      }

      if (data.policies.artificialIntelligence) {
        sections.push(
          new Paragraph({
            text: "Use of Artificial Intelligence Tools",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: "You may use AI-driven tools to assist you in learning but remember that your objective is to understand, achieve, and apply the course competencies and outcomes. While you may use tools for learning, specific assessments in this course will disallow the use of AI-driven tools to assert that you have attained course learning outcomes. This is because a graduate must be able to analyze, assess and produce work unassisted by AI technology. Where tools are allowed: you must acknowledge all tools used to assist you. If applicable, you must provide links to chat logs. Using AI-driven tools where prohibited constitutes an academic offense.",
            spacing: { after: 120 },
          })
        );
      }

      if (data.policies.plagiarismDetection) {
        sections.push(
          new Paragraph({
            text: "Use of Plagiarism Detection Software",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: "All submitted code may be passed through a plagiarism detection software, such as the plagiarism detector embedded in Codio, the Moss Software Similarity Detection System, or similar systems. If a student does not wish to have their assignments passed through plagiarism detection software, they should contact the instructor for an alternative. Please note, that code not passed through plagiarism detection software will necessarily receive closer scrutiny. See the Policy on Student Submission of Assignments and Use of Originality Checking Software for more information.",
            spacing: { after: 120 },
          })
        );
      }

      if (data.policies.responsibleComputing) {
        sections.push(
          new Paragraph({
            text: "Responsible Computing Policy",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: "Usage of all computing resources in the Faculty of Computer Science must be within the Dalhousie Acceptable Use Policies, and the Faculty of Computer Science Responsible Computing Policy.",
            spacing: { after: 120 },
          })
        );
      }

      if (data.policies.universityStatements) {
        sections.push(
          new Paragraph({
            text: "University Statements",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: "This course is governed by the academic rules and regulations set forth in the University Calendar and the Senate.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Academic Calendars", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Territorial Acknowledgement", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Dalhousie University is located in Mi'kma'ki, the ancestral and unceded territory of the Mi'kmaq. We are all Treaty people.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Internationalization", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "At Dalhousie, 'thinking and acting globally' enhances the quality and impact of education, supporting learning that is interdisciplinary, cross-cultural, global in reach, and orientated toward solving problems that extend across national borders. (read more: International Centre)",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Academic Integrity", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "At Dalhousie University, we are guided in all of our work by the values of academic integrity: honesty, trust, fairness, responsibility and respect. As a student, you are required to demonstrate these values in all of the work you do. The University provides policies and procedures that every member of the university community is required to follow to ensure academic integrity. (read more: Academic Integrity)",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Accessibility", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "The Student Accessibility Centre is Dalhousie's centre of expertise for matters related to student accessibility and accommodation. If there are aspects of the design, instruction, and/or experiences within this course (online or in-person) that result in barriers to your inclusion please contact the Student Accessibility Centre for all courses offered by Dalhousie with the exception of Truro.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Conduct in the Classroom — Culture of Respect", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Substantial and constructive dialogue on challenging issues is an important part of academic inquiry and exchange. It requires willingness to listen and tolerance of opposing points of view. Consideration of individual differences and alternative viewpoints is required of all class members, towards each other, towards instructors, and towards guest speakers. While expressions of differing perspectives are welcome and encouraged, the words and language used should remain within acceptable bounds of civility and respect.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Diversity and Inclusion — Culture of Respect", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Every person at Dalhousie has a right to be respected and safe. We believe inclusiveness is fundamental to education. We stand for equality. Dalhousie is strengthened in our diversity. We are a respectful and inclusive community. We are committed to being a place where everyone feels welcome and supported, which is why our Strategic Direction prioritizes fostering a culture of diversity and inclusiveness (Strategic Priority 5.2). (read more: Office for Equity and Inclusion and the FCS Culture of Respect CoReCS)",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Student Code of Conduct", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Everyone at Dalhousie is expected to treat others with dignity and respect. The Code of Student Conduct allows Dalhousie to take disciplinary action if students don't follow this community expectation. When appropriate, violations of the code can be resolved in a reasonable and informal manner—perhaps through a restorative justice process. If an informal resolution can't be reached, or would be inappropriate, procedures exist for formal dispute resolution. (read more: Code of Student Conduct)",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Fair Dealing Policy", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "The Dalhousie University Fair Dealing Policy provides guidance for the limited use of copyright protected material without the risk of infringement and without having to seek the permission of copyright owners. It is intended to provide a balance between the rights of creators and the rights of users at Dalhousie. (read more: Fair Dealing Policy)",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Originality Checking Software", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "The course instructor may use Dalhousie's approved originality checking software and Google to check the originality of any work submitted for credit, in accordance with the Student Submission of Assignments and Use of Originality Checking Software Policy. Students are free, without penalty of grade, to choose an alternative method of attesting to the authenticity of their work, and must inform the instructor no later than the last day to add/drop classes of their intent to choose an alternate method. (read more: Policy on Student Submission of Assignments and Use of Originality Checking Software)",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Student Use of Course Materials", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "These course materials are designed for use as part of the CSCI courses at Dalhousie University and are the property of the instructor unless otherwise stated. Third party copyrighted materials (such as books, journal articles, music, videos, etc.) have either been licensed for use in this course or fall under an exception or limitation in Canadian Copyright law. Copying this course material for distribution (e.g., uploading material to a commercial third party website) may lead to a violation of Copyright law.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Learning and Support Resources", bold: true })],
            spacing: { before: 100, after: 60 },
          }),
          new Paragraph({
            text: "Please see the Academic Support website.",
            spacing: { after: 120 },
          })
        );
      }

      if (data.policies.customPolicy) {
        sections.push(
          new Paragraph({
            text: "Custom Policy",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: data.policies.customPolicy,
            spacing: { after: 120 },
          })
        );
      }
    }

    // Assignments
    if (data.assignments && data.assignments.length > 0) {
      sections.push(
        new Paragraph({
          text: "Assignments",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );

      const assignmentRows = data.assignments.map((assignment: any) => {
        const descContent = assignment.description
          ? convertHtmlToDocx(assignment.description)
          : [new Paragraph("")];

        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: assignment.title || "" })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ text: assignment.date || "" })],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: descContent,
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        });
      });

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Assignment Name", bold: true }),
                      ],
                    }),
                  ],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Due Date", bold: true })],
                    }),
                  ],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Description", bold: true }),
                      ],
                    }),
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            ...assignmentRows,
          ],
        })
      );
    }
    
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    console.log("[v0] Document created successfully");

    const buffer = await Packer.toBuffer(doc);
    console.log("[v0] Buffer generated, size:", buffer.length);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${
          data.course_number || "course"
        }-syllabus.docx"`,
      },
    });
  } catch (error: any) {
    console.error("[v0] Error in API route:", error);
    console.error("[v0] Error stack:", error.stack);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}