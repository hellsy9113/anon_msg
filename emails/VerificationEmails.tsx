// sendVerificationEmail.tsx

import * as React from "react";

/**
 * Email Template Component
 */
interface VerificationEmailProps {
  username: string;
  otp: string;
}

 const VerificationEmail: React.FC<VerificationEmailProps> = ({
  username,
  otp,
}) => {
  return (
    <html>
      <head />
      <body style={styles.body}>
        <div style={styles.container}>
          <h1 style={styles.heading}>Verify Your Account</h1>

          <p style={styles.text}>Hi {username},</p>

          <p style={styles.text}>
            Thank you for signing up. Please use the OTP below to verify your
            email address:
          </p>

          <div style={styles.otpBox}>
            <p style={styles.otp}>{otp}</p>
          </div>

          <p style={styles.text}>
            This OTP is valid for a limited time. Do not share it with anyone.
          </p>

          <hr />

          <p style={styles.footer}>
            If you didn’t request this, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  );
};

/**
 * Function to generate email
 */
// export function sendVerificationEmail(username: string, otp: string) {
//   return <VerificationEmail username={username} otp={otp} />;
// }

/**
 * Styles
 */
const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: "20px",
    margin: "40px auto",
    borderRadius: "8px",
    maxWidth: "500px",
  },
  heading: {
    textAlign: "center" as const,
    color: "#333",
  },
  text: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5",
  },
  otpBox: {
    textAlign: "center" as const,
    margin: "20px 0",
  },
  otp: {
    fontSize: "28px",
    fontWeight: "bold",
    letterSpacing: "4px",
    color: "#000",
  },
  footer: {
    fontSize: "12px",
    color: "#999",
    textAlign: "center" as const,
  },
};

export default VerificationEmail;