def clean_json_string(json_string):
    return json_string.replace("```json", "").replace("```", "").strip()

json_string = """```json
{
  "question": "Write a Java method that takes a string and returns the longest palindromic substring using dynamic programming.",
  "answer": "public class LongestPalindromicSubstring {\n    public static String longestPalindrome(String s) {\n        int n = s.length();\n        if (n == 0) return \"\";\n        boolean[][] dp = new boolean[n][n];\n        String longest = \"\";\n        for (int i = 0; i < n; i++) {\n            dp[i][i] = true;\n            longest = s.substring(i, i + 1);\n        }\n        for (int i = 0; i < n - 1; i++) {\n            if (s.charAt(i) == s.charAt(i + 1)) {\n                dp[i][i + 1] = true;\n                longest = s.substring(i, i + 2);\n            }\n        }\n        for (int len = 3; len <= n; len++) {\n            for (int i = 0; i < n - len + 1; i++) {\n                int j = i + len - 1;\n                if (dp[i + 1][j - 1] && s.charAt(i) == s.charAt(j)) {\n                    dp[i][j] = true;\n                    longest = s.substring(i, j + 1);\n                }\n            }\n        }\n        return longest;\n    }\n    public static void main(String[] args) {\n        System.out.println(longestPalindrome(\"babad\")); // Output: \"bab\" or \"aba\"\n    }\n}"
}```"""

cleaned_string = clean_json_string(json_string)
print(cleaned_string)
