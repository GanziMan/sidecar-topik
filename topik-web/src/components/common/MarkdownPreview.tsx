import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
interface MarkdownPreviewProps {
  markdown: string;
}

const MarkdownPreviewComponent: React.FC<MarkdownPreviewProps> = ({ markdown }) => {
  return (
    <div className="wmde-markdown-var">
      <MarkdownPreview className="bg-white" source={markdown} style={{ width: "100%", backgroundColor: "white" }} />
    </div>
  );
};

export default MarkdownPreviewComponent;
