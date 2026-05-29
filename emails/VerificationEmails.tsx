import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Container,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Verification Code</title>

        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>Your verification code is: {otp}</Preview>

      <Section
        style={{
          backgroundColor: "#f6f9fc",
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "8px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <Row>
            <Heading
              as="h2"
              style={{
                color: "#111827",
                marginBottom: "20px",
              }}
            >
              Hello {username},
            </Heading>
          </Row>

          <Row>
            <Text
              style={{
                fontSize: "16px",
                color: "#374151",
                lineHeight: "24px",
              }}
            >
              Thank you for registering. Please use the verification
              code below to complete your registration.
            </Text>
          </Row>

          <Row>
            <Text
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                letterSpacing: "6px",
                textAlign: "center",
                color: "#2563eb",
                margin: "30px 0",
              }}
            >
              {otp}
            </Text>
          </Row>

          <Row>
            <Text
              style={{
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "22px",
              }}
            >
              If you did not request this verification code,
              you can safely ignore this email.
            </Text>
          </Row>
        </Container>
      </Section>
    </Html>
  );
}