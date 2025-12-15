import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FieldSelection } from './components/FieldSelection';
import { Practice } from './components/Practice';
import { QuestionFlow } from './components/QuestionFlow';
import { CustomJobInput } from './components/CustomJobInput';
import { CustomQuestionInput } from './components/CustomQuestionInput';
import { View, QuestionCategory, Question, Recording } from './types';

// Mock Data
const INITIAL_QUESTIONS: Record<string, Question[]> = {
  [QuestionCategory.UX_DESIGN]: [
    // Behavioral (Mapped to Background)
    { id: 'ux-beh-1', text: 'Can you walk me through your design background and career path?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-2', text: 'What type of products have you primarily designed for?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-3', text: 'How do you usually collaborate with product managers and engineers?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-4', text: 'Which design tools do you use most, and why?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-5', text: 'How do you stay updated with UX trends?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-6', text: 'What is your design process from concept to handoff?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-7', text: 'How do you incorporate user feedback into your designs?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-8', text: 'What design project are you most proud of?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-9', text: 'How do you handle design critiques?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-10', text: 'Have you worked with design systems before?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-11', text: 'What industries have you designed products for?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-12', text: 'How do you balance creativity with usability?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-13', text: 'What accessibility standards are you familiar with?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-14', text: 'How do you prioritize features when designing an interface?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-15', text: 'Have you worked on mobile-first or responsive designs?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-16', text: 'How do you measure the success of a design?', category: QuestionCategory.UX_DESIGN, type: 'Background' },
    { id: 'ux-beh-17', text: 'What motivates you as a UX designer?', category: QuestionCategory.UX_DESIGN, type: 'Background' },

    // Technical
    { id: 'ux-tech-1', text: 'What are the core principles of UX design?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-2', text: 'How do you ensure consistency across a product?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-3', text: 'What is the difference between UX and UI?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-4', text: 'How do you design for accessibility?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-5', text: 'What is a design system, and why is it important?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-6', text: 'How do you approach typography selection?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-7', text: 'Explain your approach to color usage in UX design.', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-8', text: 'How do you design for different screen sizes?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-9', text: 'What is usability testing, and how do you conduct it?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-10', text: 'How do you handle edge cases in UX design?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-11', text: 'What are common UX mistakes to avoid?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-12', text: 'How do you collaborate with developers during handoff?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-13', text: 'What is the role of micro-interactions?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-14', text: 'How do you design for performance constraints?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-15', text: 'What tools do you use for prototyping?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-16', text: 'How do you document design decisions?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },
    { id: 'ux-tech-17', text: 'How do you handle localization and internationalization?', category: QuestionCategory.UX_DESIGN, type: 'Technical' },

    // Situational
    { id: 'ux-sit-1', text: 'Tell me about a time you disagreed with a stakeholder.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-2', text: 'Describe a project where user feedback conflicted with business goals.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-3', text: 'How would you redesign a poorly performing experience?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-4', text: 'Tell me about a design that failed and what you learned.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-5', text: 'How do you handle tight deadlines?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-6', text: 'Describe a time you had limited requirements.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-7', text: 'How would you design for users unfamiliar with technology?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-8', text: 'Tell me about a time you significantly improved usability.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-9', text: 'How do you respond to vague feedback?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-10', text: 'Describe a time you simplified a complex experience.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-11', text: 'How would you handle multiple design requests at once?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-12', text: 'Tell me about a cross-functional challenge you faced.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-13', text: 'How do you handle last-minute changes?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-14', text: 'Describe a time you advocated for the user.', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-15', text: 'How would you design an onboarding experience?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
    { id: 'ux-sit-16', text: 'How would you approach redesigning an existing product?', category: QuestionCategory.UX_DESIGN, type: 'Situational' },
  ],
  [QuestionCategory.ENGINEERING]: [
    // Behavioral (Mapped to Background)
    { id: 'eng-beh-1', text: 'Can you describe your engineering background?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-2', text: 'What programming languages are you most comfortable with?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-3', text: 'What type of systems have you built?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-4', text: 'Have you worked in agile or scrum teams?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-5', text: 'How do you usually debug issues?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-6', text: 'What projects are you most proud of?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-7', text: 'How do you keep your technical skills up to date?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-8', text: 'What kind of products do you enjoy building?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-9', text: 'How do you approach learning a new codebase?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-10', text: 'What experience do you have with code reviews?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-11', text: 'Have you worked on scalable systems?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-12', text: 'What development tools do you use daily?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-13', text: 'How do you balance speed and code quality?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-14', text: 'What environments have you deployed to?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-15', text: 'How do you collaborate with non-technical teams?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-16', text: 'What challenges have you faced as an engineer?', category: QuestionCategory.ENGINEERING, type: 'Background' },
    { id: 'eng-beh-17', text: 'Why do you enjoy engineering?', category: QuestionCategory.ENGINEERING, type: 'Background' },

    // Technical
    { id: 'eng-tech-1', text: 'Explain the concept of object-oriented programming.', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-2', text: 'What are RESTful APIs?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-3', text: 'How do you manage application state?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-4', text: 'Explain the difference between synchronous and asynchronous code.', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-5', text: 'How do you handle error handling in your applications?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-6', text: 'What is version control, and why is it important?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-7', text: 'Explain the concept of scalability.', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-8', text: 'How do you optimize application performance?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-9', text: 'What are common security best practices?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-10', text: 'What is a database index?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-11', text: 'How do you design modular code?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-12', text: 'What is CI/CD?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-13', text: 'How do you handle concurrency?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-14', text: 'Explain the difference between SQL and NoSQL databases.', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-15', text: 'How do you write testable code?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-16', text: 'What design patterns have you used?', category: QuestionCategory.ENGINEERING, type: 'Technical' },
    { id: 'eng-tech-17', text: 'How do you ensure code maintainability?', category: QuestionCategory.ENGINEERING, type: 'Technical' },

    // Situational
    { id: 'eng-sit-1', text: 'Describe a difficult bug you fixed.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-2', text: 'Tell me about a time you missed a deadline.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-3', text: 'How do you handle conflicting technical opinions?', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-4', text: 'Describe a system you had to refactor.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-5', text: 'How do you respond to production incidents?', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-6', text: 'Tell me about a time you improved system performance.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-7', text: 'How do you prioritize technical debt?', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-8', text: 'Describe working under pressure.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-9', text: 'How do you handle unclear requirements?', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-10', text: 'Tell me about a failed implementation.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-11', text: 'How do you approach mentoring junior engineers?', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-12', text: 'Describe a time you pushed back on a requirement.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-13', text: 'How do you handle scope creep?', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-14', text: 'Tell me about a successful deployment.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-15', text: 'How do you ensure system reliability?', category: QuestionCategory.ENGINEERING, type: 'Situational' },
    { id: 'eng-sit-16', text: 'Describe a time you learned a new technology quickly.', category: QuestionCategory.ENGINEERING, type: 'Situational' },
  ],
  [QuestionCategory.DATA_ANALYTICS]: [
    // Behavioral (Mapped to Background)
    { id: 'da-beh-1', text: 'Can you describe your experience as a data analyst?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-2', text: 'What industries have you worked in?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-3', text: 'What tools do you use most frequently?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-4', text: 'How do you approach data cleaning?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-5', text: 'What types of data have you analyzed?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-6', text: 'How do you communicate insights to stakeholders?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-7', text: 'What dashboards have you built?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-8', text: 'How do you validate data accuracy?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-9', text: 'What projects are you most proud of?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-10', text: 'How do you prioritize analysis requests?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-11', text: 'How do you handle incomplete data?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-12', text: 'What metrics do you commonly track?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-13', text: 'How do you stay current with analytics trends?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-14', text: 'What role does storytelling play in data?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-15', text: 'Have you worked with large datasets?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-16', text: 'How do you document your analysis?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },
    { id: 'da-beh-17', text: 'What motivates you in analytics work?', category: QuestionCategory.DATA_ANALYTICS, type: 'Background' },

    // Technical
    { id: 'da-tech-1', text: 'What is the difference between descriptive and predictive analytics?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-2', text: 'Explain normalization in databases.', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-3', text: 'What is a KPI?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-4', text: 'How do you use SQL in analysis?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-5', text: 'Explain the concept of data modeling.', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-6', text: 'What are data visualization best practices?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-7', text: 'How do you handle outliers?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-8', text: 'What statistical methods do you commonly use?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-9', text: 'Explain correlation vs causation.', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-10', text: 'How do you ensure data integrity?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-11', text: 'What is ETL?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-12', text: 'How do you optimize SQL queries?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-13', text: 'What tools do you use for visualization?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-14', text: 'How do you approach A/B testing?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-15', text: 'What is sampling bias?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-16', text: 'How do you work with unstructured data?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },
    { id: 'da-tech-17', text: 'What is data governance?', category: QuestionCategory.DATA_ANALYTICS, type: 'Technical' },

    // Situational
    { id: 'da-sit-1', text: 'Tell me about a time data changed a business decision.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-2', text: 'Describe a challenging dataset you worked with.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-3', text: 'How do you handle conflicting data results?', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-4', text: 'Tell me about a missed insight.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-5', text: 'How do you manage tight deadlines?', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-6', text: 'Describe working with non-technical stakeholders.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-7', text: 'How do you validate assumptions?', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-8', text: 'Tell me about a failed analysis.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-9', text: 'How do you prioritize multiple requests?', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-10', text: 'Describe a time you automated a process.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-11', text: 'How do you handle vague questions?', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-12', text: 'Tell me about a data discrepancy you resolved.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-13', text: 'How do you explain complex results simply?', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-14', text: 'Describe a time you influenced strategy.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-15', text: 'How do you ensure ethical data use?', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
    { id: 'da-sit-16', text: 'Tell me about a project that had high impact.', category: QuestionCategory.DATA_ANALYTICS, type: 'Situational' },
  ],
  [QuestionCategory.CYBERSECURITY]: [
    // Behavioral (Mapped to Background)
    { id: 'cs-beh-1', text: 'Can you describe your cybersecurity background?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-2', text: 'What security domains have you worked in?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-3', text: 'What certifications do you hold?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-4', text: 'How do you stay current with threats?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-5', text: 'What environments have you secured?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-6', text: 'Have you worked with compliance frameworks?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-7', text: 'What tools do you commonly use?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-8', text: 'What types of attacks have you investigated?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-9', text: 'How do you document security incidents?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-10', text: 'What industries have you supported?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-11', text: 'How do you assess risk?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-12', text: 'What motivates you in cybersecurity?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-13', text: 'Have you conducted security training?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-14', text: 'How do you work with engineering teams?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-15', text: 'What challenges have you faced in security roles?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-16', text: 'How do you prioritize vulnerabilities?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },
    { id: 'cs-beh-17', text: 'What does defense-in-depth mean to you?', category: QuestionCategory.CYBERSECURITY, type: 'Background' },

    // Technical
    { id: 'cs-tech-1', text: 'What is the CIA triad?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-2', text: 'Explain encryption vs hashing.', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-3', text: 'What is a firewall?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-4', text: 'How does multi-factor authentication work?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-5', text: 'What is phishing?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-6', text: 'Explain vulnerability scanning.', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-7', text: 'What is penetration testing?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-8', text: 'How do you secure APIs?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-9', text: 'What is least privilege?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-10', text: 'How do you monitor for intrusions?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-11', text: 'Explain SSL/TLS.', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-12', text: 'What is a zero-day vulnerability?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-13', text: 'How do you secure cloud environments?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-14', text: 'What is SIEM?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-15', text: 'How do you handle incident response?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-16', text: 'What is malware analysis?', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },
    { id: 'cs-tech-17', text: 'Explain security patch management.', category: QuestionCategory.CYBERSECURITY, type: 'Technical' },

    // Situational
    { id: 'cs-sit-1', text: 'Tell me about a security incident you handled.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-2', text: 'How would you respond to a data breach?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-3', text: 'Describe a time you prevented an attack.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-4', text: 'How do you handle false positives?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-5', text: 'Tell me about a failed security control.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-6', text: 'How do you prioritize threats?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-7', text: 'Describe working under pressure during an incident.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-8', text: 'How do you communicate risk to executives?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-9', text: 'Tell me about improving security posture.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-10', text: 'How do you balance security and usability?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-11', text: 'Describe handling non-compliant teams.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-12', text: 'How do you respond to zero-day threats?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-13', text: 'Tell me about a difficult investigation.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-14', text: 'How do you conduct post-incident reviews?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-15', text: 'How do you train employees on security?', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
    { id: 'cs-sit-16', text: 'Describe a time you influenced security strategy.', category: QuestionCategory.CYBERSECURITY, type: 'Situational' },
  ],
  [QuestionCategory.CUSTOM]: []
};

export default function App() {
  const [history, setHistory] = useState<View[]>([View.FIELD_SELECTION]);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [dontAskRedo, setDontAskRedo] = useState(false);

  const currentView = history[currentViewIndex];

  const navigateTo = (view: View) => {
    const newHistory = history.slice(0, currentViewIndex + 1);
    newHistory.push(view);
    setHistory(newHistory);
    setCurrentViewIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (currentViewIndex > 0) {
      setCurrentViewIndex(prev => prev - 1);
    }
  };

  const handleForward = () => {
    if (currentViewIndex < history.length - 1) {
      setCurrentViewIndex(prev => prev + 1);
    }
  };

  const handleSelectCategory = (cat: QuestionCategory) => {
    setSelectedCategory(cat);
    if (cat === QuestionCategory.CUSTOM) {
      navigateTo(View.CUSTOM_DESCRIPTION);
    }
  };

  const handleStartPractice = () => {
    // Get all available questions for the selected category from the initial bank
    const allQuestions = INITIAL_QUESTIONS[selectedCategory!] || [];

    // Shuffle and pick 5 random questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const randomFive = shuffled.slice(0, 5);

    // Update the state to only show these 5 for the session
    setQuestions(prev => ({
      ...prev,
      [selectedCategory!]: randomFive
    }));

    if (randomFive.length > 0) {
      setSelectedQuestion(randomFive[0]);
      navigateTo(View.QUESTION_FLOW);
    } else {
       // Fallback or empty state
       navigateTo(View.ALL_QUESTIONS);
    }
  };

  const handleStartCustomJob = (description: string, generatedQuestions: string[]) => {
    // Convert generated strings to Question objects
    const newQuestions: Question[] = generatedQuestions.map((text, index) => ({
      id: `gen-${Date.now()}-${index}`,
      text: text,
      category: QuestionCategory.CUSTOM,
      type: 'Custom question'
    }));

    setQuestions(prev => ({
      ...prev,
      [QuestionCategory.CUSTOM]: [...(prev[QuestionCategory.CUSTOM] || []), ...newQuestions]
    }));
    
    // As per requirement "Display the list of questions that were generated earlier",
    // when "See all generated questions" is clicked in CustomJobInput, we navigate here.
    setSelectedCategory(QuestionCategory.CUSTOM);
    navigateTo(View.ALL_QUESTIONS);
  };

  const handleManualAddCustom = () => {
    navigateTo(View.CUSTOM_ADD);
  };

  const handleAddCustomQuestion = (text: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: text,
      category: QuestionCategory.CUSTOM,
      type: 'Custom question'
    };
    
    setQuestions(prev => {
      const updated = {
          ...prev,
          [QuestionCategory.CUSTOM]: [...(prev[QuestionCategory.CUSTOM] || []), newQuestion]
      };
      return updated;
    });

    setSelectedCategory(QuestionCategory.CUSTOM); 
    navigateTo(View.ALL_QUESTIONS);
  };

  const handleSeeAllQuestions = () => {
    // If the user wants to see all questions, we should ensure the full list is loaded
    // instead of the potential subset from "Practice with 5"
    if (selectedCategory && selectedCategory !== QuestionCategory.CUSTOM) {
       setQuestions(prev => ({
          ...prev,
          [selectedCategory]: INITIAL_QUESTIONS[selectedCategory]
       }));
    }
    navigateTo(View.ALL_QUESTIONS);
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    navigateTo(View.QUESTION_FLOW);
  };

  const renderView = () => {
    switch (currentView) {
      case View.FIELD_SELECTION:
        return (
          <FieldSelection 
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onStartPractice={handleStartPractice}
            onSeeAllQuestions={handleSeeAllQuestions}
          />
        );
      case View.CUSTOM_DESCRIPTION:
        return (
          <CustomJobInput 
            onStart={handleStartCustomJob}
            onManualAdd={handleManualAddCustom}
          />
        );
      case View.CUSTOM_ADD:
        return (
          <CustomQuestionInput 
             onAdd={handleAddCustomQuestion}
          />
        );
      case View.ALL_QUESTIONS:
        return (
          <Practice 
            category={selectedCategory || QuestionCategory.UX_DESIGN}
            questions={questions[selectedCategory!] || questions[QuestionCategory.UX_DESIGN]}
            onSelectQuestion={handleSelectQuestion}
          />
        );
      case View.QUESTION_FLOW:
        return (
          <QuestionFlow 
            question={selectedQuestion!}
            onComplete={(rec) => console.log(rec)}
            dontAskRedo={dontAskRedo}
            setDontAskRedo={setDontAskRedo}
          />
        );
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col">
      <Navbar 
        onBack={handleBack} 
        onForward={handleForward}
        canGoBack={currentViewIndex > 0}
        canGoForward={currentViewIndex < history.length - 1}
      />
      <main className="flex-grow">
        {renderView()}
      </main>
    </div>
  );
}