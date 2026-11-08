/* Contact links — shared by the nav and the footer. */

export const EMAIL_HREF = "mailto:bmflora@usc.edu";
export const X_HREF = "https://x.com/bjmflr";
export const LINKEDIN_HREF = "https://www.linkedin.com/in/benjaminflora";
export const RESUME_HREF = "/resume.pdf";
export const RESUME_FILENAME = "BenjaminFlora_ResumeF26.pdf";

export function downloadResume() {
  const link = document.createElement("a");
  link.href = RESUME_HREF;
  link.download = RESUME_FILENAME;
  link.click();
}
