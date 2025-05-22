import React from 'react';

// This is a component that will be used to ensure proper CSS loading
// It should be imported in your App.jsx or main.jsx file
const DocumentHead = () => {
  return (
    <div style={{ display: 'none' }} data-css-check="true">
      <link rel="stylesheet" href="/src/index.css" />
      <link rel="stylesheet" href="/src/App.css" />
    </div>
  );
};
export default DocumentHead;