import React, { useCallback, useState } from "react";
import "./App.css";
import { generateContent, purifyCode } from "./helper";

const App = () => {
  const [info, setInfo] = useState({
    userQuery: "",
    error: "",
    generatedComponent: null,
    loading: false,
  });

  const handleChange = useCallback((e) => {
    setInfo((prev) => ({
      ...prev,
      userQuery: e.target.value,
      error: "",
    }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (info.loading) return;

    if (!info.userQuery.trim()) {
      return setInfo((prev) => ({
        ...prev,
        error: "Please enter a valid query",
      }));
    }

    setInfo((prev) => ({
      ...prev,
      loading: true,
      error: "",
      generatedComponent: null,
    }));

    try {
      // Generate AI content
      let componentCode = await generateContent(info.userQuery);

      // Clean unwanted imports/markdown
      componentCode = purifyCode(componentCode);

      if (!componentCode) {
        throw new Error("AI did not return valid component code");
      }

      // Dynamically create component
      const Component = new Function(
        "React",
        `
        try {
          ${componentCode}
          return GeneratedComponent;
        } catch (error) {
          throw error;
        }
        `
      )(React);

      setInfo((prev) => ({
        ...prev,
        generatedComponent: <Component />,
        userQuery: "",
        error: "",
      }));
    } catch (error) {
      console.error("Error:", error);
      setInfo((prev) => ({
        ...prev,
        error: error?.message || "Something went wrong",
      }));
    } finally {
      setInfo((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }, [info.userQuery, info.loading]);

  return (
    <div className="codeGeneratorParentContainer">
      <div className="inputSectionContainer">
        <textarea
          className="textAreaInput"
          placeholder="Describe your react component ..."
          value={info.userQuery}
          onChange={handleChange}
        />
        <button
          className="generateButton"
          onClick={handleGenerate}
          disabled={info.loading}
        >
          {info.loading ? "Generating..." : "Generate"}
        </button>
      </div>

      <div className="previewSectionContainer">
        {info.error && (
          <div className="error-message">{info.error}</div>
        )}

        {info.generatedComponent ? (
          info.generatedComponent
        ) : (
          <div className="emptyMessage">
            {info.loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <span>Generating Component...</span>
              </div>
            ) : (
              <p>
                Describe your component in the input field and click Generate.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
