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

    return new NextResponse(buffer, {
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
