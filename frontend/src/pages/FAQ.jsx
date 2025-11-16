import SitemarkIcon from "../components/SitemarkIcon";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function FAQ(props) {
  return (
    <Container id="faq" sx={{ pt: { xs: 12, sm: 12 } }}>
      <Box sx={{ width: { sm: "100%", md: "60%" } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          FAQ about our product
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: { xs: 2, sm: 4 } }}
        >
          What is this app? Think of it as Waze, but without the navigation
          part, meaning it works by alerting you or allowing you to report
          things that are out of order or are a threat to civilians.<br></br>
          Why choose us? We offer a user-friendly interface along with simple
          features that will help you navigate through our website if you're
          lost.
        </Typography>
      </Box>
    </Container>
  );
}
