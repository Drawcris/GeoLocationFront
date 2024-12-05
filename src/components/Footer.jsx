import React from 'react';

function Footer() {
  return (
    <footer className="bg-blue-500 text-white py-4 mt-auto">
      <div className="container mx-auto text-center">
        <p className="mb-2">Wszelkie prawa zastrzeżone &copy; {new Date().getFullYear()}</p>
        <a
          href="https://github.com/Drawcris"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:underline"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;