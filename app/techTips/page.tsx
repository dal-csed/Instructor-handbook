import BasicAccordion from "@/components/ui/accordion-1";
import { title } from "process";
import React from "react";

const Items = [
  {
    id: 1,
    title: "Start of term",
    content: "To set up a development environment, you can follow these steps:\n\n1. Install a code editor (e.g., Visual Studio Code, Sublime Text)\n2. Install necessary programming languages and frameworks (e.g., Node.js, Python)\n3. Set up version control (e.g., Git)\n4. Configure your environment variables\n5. Test your setup by running a simple project",
  }
  ,
  {
    id: 2,
    title: "End of term",
    content: "When debugging code, consider the following best practices:\n\n1. Use a systematic approach (e.g., divide and conquer)\n2. Check for common issues (e.g., syntax errors, typos)\n3. Use debugging tools (e.g., browser developer tools, IDE debuggers)\n4. Add logging statements to track variable values and program flow\n5. Take breaks to clear your mind and approach the problem with fresh eyes",
  },
  {
    id: 3,
    title: "Accessibility",
    content: "To optimize website performance, you can implement the following tips:\n\n1. Minimize HTTP requests by combining files and using CSS sprites\n2. Optimize images by compressing them and using appropriate formats\n3. Use a content delivery network (CDN) to serve static assets\n4. Enable browser caching to reduce load times for returning visitors\n5. Minify CSS, JavaScript, and HTML files to reduce their size",
  },
  {
    id: 4,
    title: "Brightspace",
    content: "To secure a web application, consider the following measures:\n\n1. Use HTTPS to encrypt data transmitted between the client and server\n2. Implement strong authentication and authorization mechanisms\n3. Validate and sanitize user input to prevent SQL injection and cross-site scripting (XSS) attacks\n4. Keep software and dependencies up to date to patch known vulnerabilities\n5. Regularly perform security audits and penetration testing to identify and address potential weaknesses",
  },
  {
    id: 5,
    title: "MS Office",
    content: "To improve code readability, you can follow these guidelines:\n\n1. Use meaningful variable and function names that describe their purpose\n2. Write modular code by breaking it into smaller, reusable functions\n3. Add comments to explain complex logic and provide context\n4. Follow consistent coding conventions and style guides\n5. Avoid deep nesting and long functions to enhance readability",
  },
  {
    id: 6,
    title: "Codio",
    content: "To manage state in a React application, you can use the following approaches:\n\n1. Use the built-in useState hook for local component state\n2. Use the useContext hook for global state management across components\n3. Use third-party libraries like Redux or MobX for more complex state management needs\n4. Consider using the useReducer hook for managing state with complex logic\n5. Keep state as minimal as possible and derive data when necessary to avoid unnecessary re-renders",
  },
  {
    id: 7,
    title: "Crowdmark",
    content: "To optimize database performance, you can implement the following strategies:\n\n1. Use indexing to speed up query execution\n2. Optimize queries by selecting only necessary columns and using appropriate joins\n3. Regularly analyze and optimize database schema to ensure efficient data storage\n4. Implement caching mechanisms to reduce database load for frequently accessed data\n5. Monitor database performance and identify bottlenecks using profiling tools",
  }
]

const TechTips = () => {
  return (
    <div className="max-w-7xl mx-auto px-3 py-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-[#474646] text-balance">
          Tech Tips
        </h1>

        <BasicAccordion 
          items={Items}
          allowMultiple
          className=""
        />
      </div>
    </div>
  );
};

export default TechTips;
