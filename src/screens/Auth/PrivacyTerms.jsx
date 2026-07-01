import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import Header from "@components/Header";
import MainContainer from "@components/container/MainContainer";
import { getCms } from "@api/services/authService";

// Try to import WebView, fallback to null if not available
let WebView = null;
try {
  WebView = require("react-native-webview").WebView;
} catch (e) {
  console.warn(
    "react-native-webview not installed. Install it for better HTML rendering: npm install react-native-webview"
  );
}

const PrivacyTerms = ({ route, navigation }) => {
  const type = route?.params?.type || "privacy-policy";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCmsData();
  }, [type]);

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCms(type);
      if (response?.success && response?.data) {
        setData(response.data);
      } else {
        setError("Failed to load content");
      }
    } catch (err) {
      console.error("Error fetching CMS data:", err);
      setError(err?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  // Simple function to strip HTML tags and decode entities (fallback)
  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  };

  const htmlContent = data?.contents || "";
  const plainText = stripHtml(htmlContent);

  return (
    <MainContainer loader={loading}>
      <Header
        title={
          type === "term-condition" ? "Terms and Conditions" : "Privacy Policy"
        }
      />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : htmlContent ? (
        WebView ? (
          <View style={styles.contentContainer}>
            <WebView
              source={{ html: htmlContent }}
              style={styles.webView}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              scalesPageToFit={true}
            />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.contentText}>{plainText}</Text>
          </ScrollView>
        )
      ) : null}
    </MainContainer>
  );
};

export default PrivacyTerms;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    marginTop: 10,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
