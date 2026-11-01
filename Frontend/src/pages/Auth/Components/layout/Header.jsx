import React from 'react';
import "../../Styles/header.css";

function Header({ titulo }) {
  return (
    <div className="header">
      <header>
        {/* 🔥 O conteúdo do h1 passa a ser dinâmico */}
        <h1 className="header-title">{titulo}</h1>
      </header>
    </div>
  );
}

export default Header;