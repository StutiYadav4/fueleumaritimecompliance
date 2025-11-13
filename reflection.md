# Reflection

Working on this FuelEU Maritime Dashboard project was honestly one of the most challenging but also one of the most rewarding experiences I’ve had so far. I learned a lot about backend architecture, React UI work, energy formulas, and even real maritime policy details that I never thought I’d actually understand.

To be completely honest, because I had exams and other submissions going on, I couldn’t build the project to the 100% polished level I originally imagined. A lot of the work — especially the banking and pooling tabs — required debugging, re-thinking the logic, fixing crashes, and going back and forth between frontend and backend. There were moments where something worked on the UI but backend was wrong, or the backend was correct but the UI crashed. Under normal time, I would have refined everything more deeply.

But despite all the stress and rush, I genuinely gave my best.  
I did not skip the hard parts:  

- I implemented the entire banking logic (with surplus validation, apply logic, and DB communication).  
- I implemented pooling using Article 21 rules.  
- I built a clean comparison system with baseline.  
- I rebuilt parts of the backend to make sure CB calculations follow the exact FuelEU formula.  
- I created a modular architecture using clean layering and ports/adapters.  
- I structured routes, compliance, and pool endpoints cleanly.  
- I added UI tables, validations, error handling, and consistent design.

Even when things broke — and they broke a lot — I kept fixing them until they worked.  
I also learned how to test APIs with Jest + Supertest, which was completely new for me.

The biggest takeaway for me is that **I now understand a full system end-to-end**:

- how data flows from frontend → backend  
- how CB is computed  
- how surplus banking actually works  
- how pooling redistributes compliance  
- how to handle edge cases  
- how to test core logic  
- how to structure a scalable backend  

Even if I had limited time, I didn’t give up or cut corners on the actual concepts.  
I’m proud that I was able to deliver a working, understandable, and testable FuelEU dashboard.

If I had more time (after exams), I would refine UI, add graphs, polish API errors, and make the DB production-ready.

But overall:  
**I learned a lot, I built a real working system, and I gave my honest best.**


