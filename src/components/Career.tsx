import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br />
          experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Web Developer Intern</h4>
                <h5>CodeLab</h5>
              </div>
              <h3>May–Jul '25</h3>
            </div>
            <p>
              Developed and maintained full-stack web features using MongoDB, Express, React,
              and Node.js (MERN stack). Built responsive user interfaces and reusable components
              with React.js and JavaScript ES6+. Integrated RESTful APIs and optimised backend
              routes for improved performance and scalability. Collaborated with the team using
              Git and GitHub for version control and agile development.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Full-Stack Web Developer</h4>
                <h5>Upwork — Freelance</h5>
              </div>
              <h3>Jan '26–Now</h3>
            </div>
            <p>
              Launched freelancing practice on Upwork, developing responsive and user-friendly
              web applications for international clients. Built full-stack solutions using React,
              Node.js, Express, and MongoDB, focusing on clean and scalable architecture. Managed
              end-to-end client relationships — from requirements gathering through delivery,
              ensuring on-time project completion.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>MTO — Management Trainee Officer</h4>
                <h5>Maple Leaf Cement Company</h5>
              </div>
              <h3>Feb–May '26</h3>
            </div>
            <p>
              3-month internship (Feb 2, 2026 – May 2, 2026) at Maple Leaf Cement Company,
              Pakistan. Handling Oracle Database administration, developing and maintaining
              business applications on Oracle APEX, and writing complex SQL and PL/SQL queries
              for data management, reporting, and automation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
