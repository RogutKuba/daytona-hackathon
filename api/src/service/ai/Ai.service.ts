import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

const model = google('gemini-2.0-flash-lite');

export abstract class AiService {
  /**
   * Generate a browser automation task prompt based on the user's goal
   * @param goal - The high-level goal the user wants to achieve (typically describes a problem/issue)
   * @param url - The URL where the task should be performed
   * @returns A natural, exploratory task prompt that simulates a real user
   */
  static async generateBrowserTaskPrompt(
    goal: string,
    url: string
  ): Promise<string> {
    const { text } = await generateText({
      model,
      prompt: `You are an AI assistant that helps create natural, exploratory browser automation tasks that simulate real user behavior.

The experiment goal describes a problem or issue with a website. Your job is to create a task prompt that makes the browser agent behave like a REAL HUMAN user who would naturally encounter this issue while browsing.

Given:
- Issue/Problem: ${goal}
- Website URL: ${url}

Create a natural browsing task that:
1. Simulates how a real person would use the site
2. Naturally leads to encountering the described issue
3. Is exploratory and open-ended (not rigid step-by-step)
4. Focuses on the user's intent and experience
5. Documents what they observe and experience

DO NOT write rigid instructions like "click button X, then click button Y"
DO write natural exploration like "browse the site looking for products, try to find ways to narrow down your search"

Examples:

Example 1:
Issue: "Users complaining about not finding products easily or being able to filter them"
URL: "https://example-shop.com"
Output: "Visit the e-commerce website and browse for products as if you're a customer looking to buy something specific. Try to find products in a particular category, and see if there are ways to filter or narrow down your search by price, color, size, or other attributes. Take note of any difficulties you encounter while trying to find what you're looking for, and document whether filtering options are available and easy to use."

Example 2:
Issue: "Checkout process is confusing and users are abandoning their carts"
URL: "https://example-store.com"
Output: "Browse the website as a customer, add a few items to your cart, and attempt to complete the purchase. Pay attention to how clear the checkout process is, whether each step is intuitive, and if there are any points where you feel confused or unsure what to do next. Note any friction points, unclear instructions, or areas where you might abandon the purchase."

Example 3:
Issue: "Mobile navigation menu is hard to find and use"
URL: "https://example-site.com"
Output: "Navigate the website as if you're a mobile user trying to find different sections and pages. Look for the navigation menu and try to access various parts of the site. Note how easy or difficult it is to discover the menu, whether it's intuitive to use, and if you can easily find what you're looking for across different pages."

Now create a natural, exploratory browsing task for the given issue and URL. Write it as if you're instructing a real human to explore the site and experience the problem firsthand.

Return ONLY the task description, no additional formatting or explanation.`,
    });

    return text.trim();
  }

  /**
   * Analyze browser agent logs and extract insights about user experience
   * @param logs - The logs from the browser agent execution
   * @param goal - The original goal/issue being investigated
   * @returns Analyzed insights from the logs focusing on UX and the identified issue
   */
  static async analyzeBrowserLogs(
    logs: string,
    goal: string
  ): Promise<{
    success: boolean;
    summary: string;
    insights: string;
    issues: string;
  }> {
    const { text } = await generateText({
      model,
      prompt: `You are analyzing browser automation logs from an experiment investigating this issue: "${goal}"

The browser agent was simulating a real user browsing the website and naturally encountering (or not encountering) this issue.

Logs:
${logs}

Analyze the logs from a USER EXPERIENCE perspective:

1. Success: Did the agent successfully navigate the site and document the user experience? (true if they could browse and identify whether the issue exists, false if the task failed)

2. Summary: Briefly describe what the agent experienced while browsing (2-3 sentences focusing on their journey and observations)

3. Insights: Key observations about the user experience, such as:
   - Whether the described issue was actually present
   - How the issue manifested or impacted the browsing experience
   - What worked well or what was confusing
   - Any usability observations
   - Patterns in how the user navigated the site

4. Issues: Technical or UX problems encountered:
   - The main issue from the goal (if confirmed)
   - Any additional friction points or usability issues
   - Technical errors or broken functionality
   - Confusing UI/UX elements

Focus on WHAT THE USER EXPERIENCED, not just technical steps. Write insights and issues as if you're reporting on a user testing session.

Return your response as a JSON object with these exact keys: success, summary, insights, issues.
Return ONLY valid JSON, no markdown formatting or additional text.`,
    });

    // Parse the JSON response
    const cleaned = text
      .trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');
    return JSON.parse(cleaned);
  }

  /**
   * Generate suggestions for variant experiments based on the control test results
   * @param controlResults - Results from the control variant test
   * @param goal - The experiment goal/issue being addressed
   * @returns Suggested UX improvements to test as variants
   */
  static async generateExperimentVariants(
    controlResults: {
      success: boolean;
      summary: string;
      insights: string;
    },
    goal: string
  ): Promise<string[]> {
    const { text } = await generateText({
      model,
      prompt: `You are analyzing results from a control variant test and need to suggest UX improvements to test as experimental variants.

Original Issue: ${goal}

Control Variant Test Results:
- Success: ${controlResults.success}
- Summary: ${controlResults.summary}
- Key Insights: ${controlResults.insights}

Based on these results, generate 3-5 specific, actionable UX improvements that could address the identified issues and improve the user experience.

Each suggestion should:
1. Directly address the issues found in the control test
2. Be a concrete UI/UX change that can be implemented
3. Focus on solving user problems, not just cosmetic changes
4. Be specific enough to implement (e.g., "Add a filter sidebar with price, size, and color options" not just "improve filtering")

Examples of GOOD suggestions:
- "Add a sticky filter sidebar on the left with collapsible sections for price range, category, color, and size"
- "Implement a search bar with autocomplete that filters products in real-time as users type"
- "Add visual breadcrumbs showing the current category and allow users to click to go back"
- "Create a 'Quick View' button on product cards to preview details without leaving the browse page"

Examples of BAD suggestions (too vague or cosmetic):
- "Make the site better"
- "Change button colors"
- "Improve navigation"

Return your response as a JSON array of strings, with each string being one specific improvement.
Return ONLY valid JSON, no markdown formatting or additional text.`,
    });

    const cleaned = text
      .trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');
    return JSON.parse(cleaned);
  }
}
