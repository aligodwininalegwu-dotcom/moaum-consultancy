"""
Generates the UML diagrams for the MOAUM Consultancy portal as SVG.

    python docs/diagrams/generate.py

Writes use-case-diagram.svg and class-diagram.svg next to this file.
Arrowheads are drawn as plain shapes (no SVG markers) so the files render
the same in browsers, Word and Inkscape.
"""
import math
from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(__file__).parent
FONT = "Segoe UI, Arial, Helvetica, sans-serif"
INK = "#1f2a27"
GREEN = "#0A4D3C"
GOLD = "#C9A227"


class Svg:
    def __init__(self, w, h):
        self.w, self.h, self.parts = w, h, []

    def add(self, s):
        self.parts.append(s)

    def text(self, x, y, s, size=13, weight="normal", anchor="middle", fill=INK, style="normal"):
        self.add(
            f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" '
            f'font-style="{style}" text-anchor="{anchor}" fill="{fill}">{escape(s)}</text>'
        )

    def line(self, x1, y1, x2, y2, dashed=False, width=1.3, color=INK):
        dash = ' stroke-dasharray="7 5"' if dashed else ""
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="{width}"{dash}/>')

    def open_arrow(self, x1, y1, x2, y2, size=11):
        """Open (stick) arrowhead at (x2, y2) pointing along x1,y1 -> x2,y2."""
        a = math.atan2(y2 - y1, x2 - x1)
        for d in (0.45, -0.45):
            self.line(x2, y2, x2 - size * math.cos(a + d), y2 - size * math.sin(a + d))

    def hollow_triangle(self, x1, y1, x2, y2, size=15):
        """UML generalisation head at (x2, y2)."""
        a = math.atan2(y2 - y1, x2 - x1)
        p1 = (x2 - size * math.cos(a + 0.5), y2 - size * math.sin(a + 0.5))
        p2 = (x2 - size * math.cos(a - 0.5), y2 - size * math.sin(a - 0.5))
        self.add(f'<polygon points="{x2:.1f},{y2:.1f} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}" fill="#ffffff" stroke="{INK}" stroke-width="1.3"/>')
        return (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2

    def save(self, name):
        body = "\n".join(self.parts)
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">\n'
            f'<rect width="100%" height="100%" fill="#ffffff"/>\n{body}\n</svg>\n'
        )
        (OUT / name).write_text(svg, encoding="utf-8")
        print("wrote", OUT / name)


# ── Use case diagram ───────────────────────────────────────────────────

RX, RY = 112, 27  # use case ellipse radii


def edge_point(cx, cy, tx, ty, rx=RX, ry=RY):
    """Point on an ellipse's edge in the direction of (tx, ty)."""
    a = math.atan2(ty - cy, tx - cx)
    return cx + rx * math.cos(a), cy + ry * math.sin(a)


def actor(svg, x, y, label, sub=None):
    """Stick figure with its head top at y; returns its body centre for association lines."""
    svg.add(f'<circle cx="{x}" cy="{y + 13}" r="13" fill="#ffffff" stroke="{INK}" stroke-width="1.6"/>')
    svg.line(x, y + 26, x, y + 66, width=1.6)
    svg.line(x - 24, y + 40, x + 24, y + 40, width=1.6)
    svg.line(x, y + 66, x - 20, y + 96, width=1.6)
    svg.line(x, y + 66, x + 20, y + 96, width=1.6)
    svg.text(x, y + 116, label, size=14, weight="bold")
    if sub:
        svg.text(x, y + 133, sub, size=11, fill="#5d6b66", style="italic")
    return x, y + 50


def system_actor(svg, x, y, label):
    """External system drawn as a «system» box."""
    w, h = 170, 56
    svg.add(f'<rect x="{x - w / 2}" y="{y}" width="{w}" height="{h}" rx="4" fill="#f3f6f5" stroke="{INK}" stroke-width="1.4"/>')
    svg.text(x, y + 22, "«system»", size=11, fill="#5d6b66")
    svg.text(x, y + 41, label, size=14, weight="bold")
    return x, y


def use_case_diagram():
    svg = Svg(1640, 1240)
    svg.text(820, 34, "Use Case Diagram: MOAUM Consultancy Portal", size=22, weight="bold", fill=GREEN)

    # System boundary
    bx, by, bw, bh = 270, 70, 1100, 1000
    svg.add(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="10" fill="#fbfdfc" stroke="{GREEN}" stroke-width="2"/>')
    svg.text(bx + bw / 2, by + 28, "MOAUM Consultancy Portal", size=16, weight="bold", fill=GREEN)

    L, M, R = 470, 820, 1170  # column centres
    uc = {
        # Public visitor
        "browse": (L, 140, "Browse Services & Programmes"),
        "shops": (L, 210, "View Shop Availability"),
        "track": (L, 280, "Track Application Status"),
        "enquiry": (L, 350, "Submit Enquiry"),
        "signup": (L, 420, "Create Account"),
        "login": (L, 490, "Log In"),
        # Student / applicant
        "apply": (L, 600, "Apply for Shop"),
        "register": (L, 670, "Register for Programme"),
        "pay": (L, 740, "Pay Programme Fee"),
        "dashboard": (L, 810, "View Dashboard & Status"),
        "letter": (L, 880, "Download Letter (PDF)"),
        "profile": (L, 950, "Manage Profile"),
        # Supporting use cases (include / extend targets)
        "docs_in": (M - 100, 640, "Upload Documents"),
        "email": (M + 110, 430, "Send Email Notification"),
        "transfer": (M - 100, 780, "Submit Transfer Reference"),
        "paystack": (M - 100, 880, "Pay Online (Paystack)"),
        "viewdocs": (M, 250, "View Applicant Documents"),
        # Staff
        "review": (R, 160, "Review Shop Application"),
        "allocate": (R, 290, "Allocate Shop"),
        "shopreg": (R, 410, "Manage Shops Register"),
        "verify": (R, 510, "Verify Payment & Confirm"),
        "messages": (R, 600, "Read Enquiries"),
        "reports": (R, 690, "View Statistics & Export"),
        # Administrator
        "users": (R, 880, "Manage Users & Roles"),
    }

    # Actors
    visitor = actor(svg, 120, 210, "Visitor", "(public)")
    student = actor(svg, 120, 690, "Student /", "Applicant")
    staff = actor(svg, 1510, 300, "Staff", "(Consultancy Unit)")
    admin = actor(svg, 1510, 760, "Administrator")
    email_sys = system_actor(svg, M + 110, 1120, "Email Service (SMTP)")
    pay_sys = system_actor(svg, M - 100, 1120, "Paystack")

    # Generalisations: Student is a Visitor; Administrator is a Staff member.
    hx, hy = svg.hollow_triangle(120, 690, 120, 360)
    svg.line(120, 690, hx, hy, width=1.4)
    hx, hy = svg.hollow_triangle(1510, 760, 1510, 450)
    svg.line(1510, 760, hx, hy, width=1.4)

    # Associations (actor -> use case)
    def assoc(a, key):
        cx, cy, _ = uc[key]
        ex, ey = edge_point(cx, cy, a[0], a[1])
        ax = a[0] + (28 if ex > a[0] else -28)
        svg.line(ax, a[1], ex, ey, width=1.2)

    for k in ("browse", "shops", "track", "enquiry", "signup", "login"):
        assoc(visitor, k)
    for k in ("apply", "register", "pay", "dashboard", "letter", "profile"):
        assoc(student, k)
    for k in ("review", "allocate", "shopreg", "verify", "messages", "reports"):
        assoc(staff, k)
    assoc(admin, "users")

    # External systems
    def sys_assoc(s, key):
        cx, cy, _ = uc[key]
        ex, ey = edge_point(cx, cy, s[0], s[1])
        svg.line(s[0], s[1], ex, ey, width=1.2)

    sys_assoc(email_sys, "email")
    sys_assoc(pay_sys, "paystack")

    # «include» / «extend» (arrow points to the included / extended use case).
    # Labels are drawn after the ellipses so they're never hidden.
    labels = []

    def rel(src, dst, label, lx=0, ly=-6):
        sx, sy, _ = uc[src]
        dx, dy, _ = uc[dst]
        x1, y1 = edge_point(sx, sy, dx, dy)
        x2, y2 = edge_point(dx, dy, sx, sy)
        svg.line(x1, y1, x2, y2, dashed=True, width=1.1)
        svg.open_arrow(x1, y1, x2, y2)
        mx, my = (x1 + x2) / 2 + lx, (y1 + y2) / 2 + ly
        labels.append((mx, my, label))

    rel("apply", "docs_in", "«include»", lx=58, ly=-12)
    rel("apply", "email", "«include»", lx=-30, ly=-4)
    rel("register", "email", "«include»", lx=10, ly=18)
    rel("enquiry", "email", "«include»")
    rel("review", "email", "«include»", lx=-44, ly=-6)
    rel("verify", "email", "«include»", lx=10, ly=12)
    rel("review", "viewdocs", "«include»")
    rel("allocate", "review", "«extend»", lx=40, ly=4)
    rel("paystack", "pay", "«extend»", lx=10, ly=16)
    rel("transfer", "pay", "«extend»", lx=26, ly=-14)

    # Draw ellipses last so they sit on top of the lines
    for key, (cx, cy, label) in uc.items():
        fill = "#fff8e6" if key in ("docs_in", "email", "paystack", "transfer", "viewdocs") else "#ffffff"
        svg.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{RX}" ry="{RY}" fill="{fill}" stroke="{INK}" stroke-width="1.4"/>')
        svg.text(cx, cy + 4.5, label, size=13)

    for mx, my, label in labels:
        svg.add(f'<rect x="{mx - 33:.1f}" y="{my - 12:.1f}" width="66" height="16" rx="3" fill="#fbfdfc"/>')
        svg.text(mx, my, label, size=11, fill="#3d4a46")

    # Key (bottom-left, clear of the external systems)
    for i, line in enumerate([
        "Key:",
        "Shaded use cases are included / extending behaviour.",
        "Hollow triangle = generalisation (Student is a Visitor; Administrator is Staff).",
        "Students, Staff and Administrators all authenticate through Log In.",
    ]):
        svg.text(40, 1120 + i * 18, line, size=11, anchor="start", fill="#5d6b66", weight="bold" if i == 0 else "normal")
    svg.save("use-case-diagram.svg")


# ── Class diagram ──────────────────────────────────────────────────────

CLASS_W = 440
LINE_H = 19


def class_box(svg, x, y, name, attrs, ops, stereotype=None, header=GREEN):
    """Three-compartment UML class box; returns (x, y, w, h)."""
    head_h = 46 if stereotype else 34
    h = head_h + 10 + len(attrs) * LINE_H + 10 + (10 + len(ops) * LINE_H if ops else 0) + 6
    svg.add(f'<rect x="{x}" y="{y}" width="{CLASS_W}" height="{h}" fill="#ffffff" stroke="{INK}" stroke-width="1.5"/>')
    svg.add(f'<rect x="{x}" y="{y}" width="{CLASS_W}" height="{head_h}" fill="{header}" stroke="{INK}" stroke-width="1.5"/>')
    if stereotype:
        svg.text(x + CLASS_W / 2, y + 17, stereotype, size=11, fill="#e9f3ef")
        svg.text(x + CLASS_W / 2, y + 36, name, size=16, weight="bold", fill="#ffffff")
    else:
        svg.text(x + CLASS_W / 2, y + 23, name, size=16, weight="bold", fill="#ffffff")
    cy = y + head_h + 10
    for a in attrs:
        cy += LINE_H
        svg.text(x + 12, cy - 4, a, size=12.5, anchor="start", fill=INK)
    if ops:
        cy += 10
        svg.line(x, cy, x + CLASS_W, cy, width=1.2)
        for o in ops:
            cy += LINE_H
            svg.text(x + 12, cy - 4 + 6, o, size=12.5, anchor="start", fill="#22413a")
    return x, y, CLASS_W, h


def enum_box(svg, x, y, name, values, w=230):
    h = 46 + len(values) * 18 + 10
    svg.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#ffffff" stroke="{INK}" stroke-width="1.3"/>')
    svg.add(f'<rect x="{x}" y="{y}" width="{w}" height="44" fill="#f6efd8" stroke="{INK}" stroke-width="1.3"/>')
    svg.text(x + w / 2, y + 17, "«enumeration»", size=11, fill="#6c4f1c")
    svg.text(x + w / 2, y + 35, name, size=14, weight="bold")
    for i, v in enumerate(values):
        svg.text(x + 12, y + 62 + i * 18, v, size=12, anchor="start")
    return h


def association(svg, p1, p2, m1, m2, label, label_offset=(0, -8), m_off=14):
    svg.line(*p1, *p2, width=1.4)
    (x1, y1), (x2, y2) = p1, p2
    horizontal = abs(y2 - y1) < abs(x2 - x1)
    if horizontal:
        d = 1 if x2 > x1 else -1
        svg.text(x1 + d * 8, y1 + 17, m1, size=12, anchor="start" if d > 0 else "end", weight="bold")
        svg.text(x2 - d * 8, y2 + 17, m2, size=12, anchor="end" if d > 0 else "start", weight="bold")
    else:
        d = 1 if y2 > y1 else -1
        svg.text(x1 + 8, y1 + d * 20, m1, size=12, anchor="start", weight="bold")
        svg.text(x2 + 8, y2 - d * 10, m2, size=12, anchor="start", weight="bold")
    mx, my = (x1 + x2) / 2 + label_offset[0], (y1 + y2) / 2 + label_offset[1]
    svg.text(mx, my, label, size=12, style="italic", fill="#3d4a46")


def class_diagram():
    svg = Svg(1800, 1230)
    svg.text(900, 36, "Class Diagram: MOAUM Consultancy Portal", size=22, weight="bold", fill=GREEN)

    GAP = 200
    X1, X2, X3 = 40, 40 + CLASS_W + GAP, 40 + 2 * (CLASS_W + GAP)
    TOP = 70
    MID = TOP + 510  # second row starts below the tallest first-row box (ShopApplication)

    user = class_box(svg, X1, TOP, "User", [
        "- id : String",
        "- name : String",
        "- email : String  {unique}",
        "- passwordHash : String",
        "- role : Role = STUDENT",
        "- phone : String [0..1]",
        "- matricNo : String [0..1]",
        "- department : String [0..1]",
        "- active : Boolean = true",
        "- createdAt : DateTime",
    ], [
        "+ register(details) : User",
        "+ logIn(email, password) : Session",
        "+ updateProfile(details) : void",
        "+ changeRole(role) : void  «admin»",
        "+ deactivate() : void  «admin»",
    ])

    app = class_box(svg, X2, TOP, "ShopApplication", [
        "- id : String",
        "- reference : String  {unique}",
        "- campus : Campus",
        "- businessName : String",
        "- businessType : String",
        "- description : String",
        "- yearsExperience : Integer = 0",
        "- phone : String",
        "- idDocument : String [0..1]",
        "- proposalDocument : String [0..1]",
        "- status : ApplicationStatus = PENDING",
        "- adminNote : String [0..1]",
        "- createdAt : DateTime",
    ], [
        "+ submit(form, idDoc, proposal) : String",
        "+ review(status, note) : void  «staff»",
        "+ allocate(shop : Shop) : void  «staff»",
        "+ track(reference) : ApplicationStatus",
        "+ allocationLetter() : PDF",
    ])

    shop = class_box(svg, X3, TOP, "Shop", [
        "- id : String",
        "- code : String  {unique}",
        "- campus : Campus",
        "- block : String",
        "- location : String",
        "- category : String",
        "- sizeSqm : Float",
        "- annualRent : Integer",
        "- status : ShopStatus = AVAILABLE",
        "- features : String",
        "- description : String",
    ], [
        "+ isAvailable() : Boolean",
        "+ setStatus(status) : void  «staff»",
        "+ save(details) : void  «staff»",
    ])

    reg = class_box(svg, X1, MID, "Registration", [
        "- id : String",
        "- reference : String  {unique}",
        "- status : RegistrationStatus = PENDING",
        "- paymentStatus : PaymentStatus = UNPAID",
        "- paymentReference : String [0..1]",
        "- phone : String",
        "- institution : String [0..1]",
        "- motivation : String [0..1]",
        "- adminNote : String [0..1]",
        "- createdAt : DateTime",
    ], [
        "+ register(programme, details) : String",
        "+ submitPaymentReference(ref) : void",
        "+ payOnline() : URL  «Paystack»",
        "+ verifyAndConfirm() : void  «staff»",
        "+ admissionLetter() : PDF",
    ])

    prog = class_box(svg, X2, MID, "Programme", [
        "- id : String",
        "- slug : String  {unique}",
        "- title : String",
        "- category : ProgrammeCategory",
        "- summary : String",
        "- description : String",
        "- duration : String",
        "- mode : String",
        "- level : String",
        "- fee : Integer",
        "- seats : Integer",
        "- startDate : DateTime",
        "- modules : String[*]",
        "- featured : Boolean = false",
        "- active : Boolean = true",
    ], [
        "+ seatsLeft() : Integer",
        "+ isOpen() : Boolean",
    ])

    msg = class_box(svg, X3, MID, "ContactMessage", [
        "- id : String",
        "- name : String",
        "- email : String",
        "- phone : String [0..1]",
        "- category : String",
        "- subject : String",
        "- message : String",
        "- read : Boolean = false",
        "- createdAt : DateTime",
    ], [
        "+ send() : void",
        "+ markRead(read : Boolean) : void  «staff»",
    ])

    # Associations
    ux, uy, uw, uh = user
    ax, ay, aw, ah = app
    sx, sy, sw, sh = shop
    rx_, ry_, rw, rh = reg
    px, py, pw, ph = prog

    association(svg, (ux + uw, ay + 120), (ax, ay + 120), "1", "0..*", "applies for")
    association(svg, (ux + uw, ay + 230), (ax, ay + 230), "0..1", "0..*", "reviews")
    association(svg, (ax + aw, ay + 120), (sx, sy + 120), "0..*", "0..1", "prefers")
    association(svg, (ax + aw, ay + 230), (sx, sy + 230), "0..*", "0..1", "is allocated")
    association(svg, (ux + 120, uy + uh), (rx_ + 120, ry_), "1", "0..*", "makes", label_offset=(36, 4))
    association(svg, (px, py + 120), (rx_ + rw, py + 120), "1", "0..*", "has")

    # Enumerations
    ex, ey = 40, max(reg[1] + reg[3], prog[1] + prog[3], msg[1] + msg[3]) + 50
    enums = [
        ("Role", ["STUDENT", "STAFF", "ADMIN"]),
        ("Campus", ["WESTERN", "EASTERN"]),
        ("ShopStatus", ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"]),
        ("ApplicationStatus", ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "ALLOCATED"]),
        ("RegistrationStatus", ["PENDING", "CONFIRMED", "REJECTED", "COMPLETED"]),
        ("PaymentStatus", ["UNPAID", "AWAITING_VERIFICATION", "PAID"]),
        ("ProgrammeCategory", ["ELEARNING", "SUMMER"]),
    ]
    widths = [150, 160, 200, 220, 220, 250, 210]
    svg.text(40, ey - 14, "Enumerations (allowed values of the typed attributes above)", size=13, anchor="start", weight="bold", fill=GREEN)
    for (name, values), w in zip(enums, widths):
        enum_box(svg, ex, ey, name, values, w)
        ex += w + 18

    svg.text(1760, 1212, "Visibility: - private, + public.  [0..1] = optional.  «staff» / «admin» = restricted operation.", size=11, anchor="end", fill="#5d6b66")
    svg.save("class-diagram.svg")


if __name__ == "__main__":
    use_case_diagram()
    class_diagram()
