import { useState } from 'react'
import { Link } from "react-router-dom";
import logo from '../../assets/logo.png'
import '../../css/Header.css'

function Header() {
return (
  <>
    <header className="header">
      <div className="header-logo">
        <img src={logo} alt="UbiCollab Logo" />
      </div>

      <div className="header-search">
        <input
          type="text"
          placeholder="문서 검색"
        />
      </div>

      <div className="header-actions">
        <Link to="/editor">
          <button type="button" className="new-document-button">
            + 새 문서
          </button>
        </Link>
        <button type="button" className="profile-button">
          프로필
        </button>
      </div>
    </header>
  
  </>
  )
}

export default Header