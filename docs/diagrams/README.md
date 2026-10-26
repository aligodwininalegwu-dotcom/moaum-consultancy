# UML diagrams

| File | Use |
| --- | --- |
| `use-case-diagram.png` | Insert into the report (3280 × 2480 px, sharp when printed) |
| `class-diagram.png` | Insert into the report (3600 × 2460 px) |
| `*.svg` | Scalable versions (open in a browser, Inkscape or Word) |
| `generate.py` | Source that draws both diagrams |

## Suggested captions

**Figure X: Use case diagram of the MOAUM Consultancy Portal.**
It shows the four actors and what each can do:
- **Visitor:** browse services and programmes, view shop availability, track an application, submit an enquiry, create an account and log in.
- **Student / Applicant:** a specialised Visitor who applies for shops, registers for programmes, pays fees, follows progress on the dashboard and downloads PDF letters.
- **Staff:** reviews applications and allocates shops, manages the shops register, verifies payments, reads enquiries and exports reports.
- **Administrator:** a specialised Staff member who also manages users and roles.

Two external systems support the portal: the Email Service (SMTP) sends notifications, and Paystack handles online payment.

**Figure Y: Class diagram of the MOAUM Consultancy Portal.**
It shows the six persistent classes, their attributes and operations, and their associations:
- A **User** applies for, and staff review, **ShopApplications**. Each application may prefer and be allocated one **Shop**.
- A User makes **Registrations**, and each Registration is for one **Programme**.
- **ContactMessage** stores public enquiries.

Status and category attributes take their values from the enumerations shown.

## Regenerating

After editing `generate.py`:

```bash
python docs/diagrams/generate.py
```

Then, to refresh the PNGs, render each SVG at 2× scale, e.g. with headless Edge or Chrome:

```bash
msedge --headless=new --force-device-scale-factor=2 --window-size=1640,1240 --screenshot=use-case-diagram.png use-case-diagram.svg
```

Use `--window-size=1800,1230` for the class diagram.
