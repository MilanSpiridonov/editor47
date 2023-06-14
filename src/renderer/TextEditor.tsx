// const writeFileP = require("write-file-p");
// import { ipcMain } from 'electron';
import { file } from 'fs-jetpack';
import React, { useRef, useState, useEffect } from 'react';
// import { IpcRenderer, ipcRenderer } from 'electron';
export function Editor() {
  const [lineNumbers, setLineNumbers] = useState(1);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentFile, setCurrentFile] = useState('');
  const lines = () => {
    const lines = [];
    for (let index = 1; index <= lineNumbers + 1; index++) {
      const lineStyle = {
        color:
          index === currentLine
            ? 'white'
            : index === lineNumbers + 1
            ? '#5555'
            : '#adadad',
        fontSize: '12pt',
        lineHeight: '16pt',
      };
      lines.push(
        <div key={index} style={lineStyle}>
          {index}
        </div>
      );
    }
    return lines;
  };

  const editorRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    const syncScroll = () => {
      if (editorRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
      }
    };

    if (editorRef.current && lineNumbersRef.current) {
      editorRef.current.addEventListener('scroll', syncScroll);
      return () => {
        editorRef.current.removeEventListener('scroll', syncScroll);
      };
    }
  }, []);

  const handleKeyUp = (e) => {
    const numberOfLines = e.target.value.split('\n').length;
    setLineNumbers(numberOfLines);
    getLineNumberAndColumnIndex(e.target);
  };
  //   useEffect(()=>{
  //     // getLineNumberAndColumnIndex(editorRef.cu)
  //   })

  const handleKeyDown = (e) => {
    if (e.keyCode === 9) {
      // Tab key
      e.preventDefault(); // Prevent default Tab behavior
      const textarea = e.target;
      const { selectionStart, selectionEnd, value } = textarea;
      const spaces = '   '; // Three spaces

      // Insert the spaces at the cursor position
      textarea.value =
        value.substring(0, selectionStart) +
        spaces +
        value.substring(selectionEnd);
      textarea.selectionStart = textarea.selectionEnd =
        selectionStart + spaces.length; // Move cursor after inserted spaces
    }
  };

  function getLineNumberAndColumnIndex(textarea) {
    const textLines = textarea.value
      .substr(0, textarea.selectionStart)
      .split('\n');
    const currentLineNumber = textLines.length;
    const currentColumnIndex = textLines[textLines.length - 1].length;
    setCurrentLine(currentLineNumber);
  }
  const inputFile = useRef<HTMLInputElement | null>(null);
  const openFileButton = () => {
    // `current` points to the mounted file input element
    if (inputFile != null) inputFile.current.click();
  };
  
  const saveFileButton = async () => {
    const filePath = inputFile.current.files[0].path;
    const data = editorRef.current.value;
    

    window.electron.ipcRenderer.sendMessage('write-file', [filePath, data]);
  };


  function onChangeFile(e) {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      setCurrentFile(inputFile.current.files[0].name);
      console.log(text);
      editorRef.current.value = text;
      //   setCurrentFile(e.target.)
    };
    reader.readAsText(e.target.files[0]);
  }

  return (
    <>
      <input
        type="file"
        id="file"
        ref={inputFile}
        onChange={(e) => onChangeFile(e)}
        style={{ display: 'none' }}
      />
      <button onClick={openFileButton}>Open file</button>
      <button onClick={saveFileButton}>Save file</button>
      <h2 style={{ color: 'white' }}>{currentFile}</h2>
      <div
        style={{
          display: 'flex',
          columnGap: '5pt',
          border: '1px white solid',
          height: '70vh',
          padding: '10pt',
          width: '80vw',
        }}
      >
        <div
          ref={lineNumbersRef}
          className="line-numbers"
          style={{
            padding: '0pt',
            width: 'auto',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {lines()}
        </div>
        <textarea
          ref={editorRef}
          style={{
            lineHeight: '16pt',
            padding: '0pt 5pt',
            border: 'none',
            outline: 'none',
            fontFamily: 'Open Sans',
            fontSize: '12pt',
            display: 'block',
            resize: 'none',
            width: '100%',
            whiteSpace: 'nowrap',
            backgroundColor: '#2f2f2f',
            color: 'white',
          }}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onMouseUp={(e) => {
            getLineNumberAndColumnIndex(e.target);
          }}
        />
      </div>
    </>
  );
}
