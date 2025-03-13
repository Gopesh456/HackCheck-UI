import Cookies from "js-cookie";

const API_BASE_URL = "http://127.0.0.1:8000/";

const fetchData = async (
  endpoint,
  method = "GET",
  body = null,
  isFormData = false,
  skipAuth = false,
  token = null
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from cookie if not provided
  const accessToken = token || Cookies.get("token");

  const options = {
    method: method,
    headers: {},
  };

  if (accessToken && !skipAuth) {
    options.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (isFormData && body instanceof FormData) {
    options.body = body; // If formData, directly assign it to body
  } else if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body); // If JSON, stringify the body
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

export { fetchData };
