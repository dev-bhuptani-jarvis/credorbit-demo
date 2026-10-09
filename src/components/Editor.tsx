import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EditorProps {
  content: string;
  setContent: (value: string) => void;
}

const Editor = ({ content, setContent }: EditorProps) => {
  const modules = {
    toolbar: {
      container: "#custom-toolbar",
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
  ];

  return (
    <>
      <div id="custom-toolbar">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="">
            <option value="">Normal</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
          </select>
        </span>

        <span className="ql-formats">
          <select className="ql-font" defaultValue="">
            <option value="">Sans Serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </span>

        <span className="ql-formats">
          <select className="ql-size" defaultValue="">
            <option value="small">Small</option>
            <option value="">Normal</option>
            <option value="large">Large</option>
            <option value="huge">Huge</option>
          </select>
        </span>

        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
          <button className="ql-blockquote" />
        </span>

        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-indent" value="-1" />
          <button className="ql-indent" value="+1" />
        </span>
      </div>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="Enter Content"
      />
    </>
  );
};

export default Editor;