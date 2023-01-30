import React from "react";

function Header() {
    return (
        <div className="row top-heading-div container">
        <div className="top-heading">
        <h1 className="intro-heading">Welcome To<span class="alvsh-title"> ALVSH </span>Services</h1>
        <p className="intro-paragraph">We manage and build elegant software solutions for small businesses, healthcare
            providers and non-profit organizations</p>
          <div className="btn-div">
            <a href="#service-section"><button type="button" class="btn btn-primary btn-info" id="serviceBtn">Explore
                our Services</button></a>
          </div>

        </div>

        </div>
    );
}

export default Header; 