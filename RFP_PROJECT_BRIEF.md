# REQUEST FOR PROPOSAL (RFP)
# Nigerian Army Integrated Personnel & Payroll System (NAIPPS)
# Data Center Infrastructure — Server Installation & Commissioning

**RFP Reference:** NAIPPS/DC/2026/001  
**Issue Date:** 2 April 2026  
**Submission Deadline:** [INSERT DATE — recommend 6-8 weeks from issue]  
**Issuing Authority:** Nigerian Army Headquarters  
**Contact:** [INSERT contact name, email, phone]

---

## 1. Introduction & Background

### 1.1 Overview

The Nigerian Army is seeking proposals from qualified firms to **design, procure, install, configure, and commission** a complete server and networking infrastructure to host the Nigerian Army Integrated Personnel & Payroll System (NAIPPS) within the Army's existing data center facility.

NAIPPS is a web-based platform that will serve as the central system for payroll processing, personnel records management, complaint handling, e-learning, and administrative operations for the entire Nigerian Army.

### 1.2 Objectives

The objective of this procurement is to:

1. Deploy a production-ready server infrastructure capable of supporting 277,000+ users
2. Ensure the system is architected for high availability, data integrity, and security
3. Provide a platform that can scale to accommodate growth over a minimum 5-year horizon
4. Deliver full documentation, training, and knowledge transfer to Army IT personnel
5. Complete deployment and handover within 12 months of contract award

### 1.3 Existing Conditions

- The Nigerian Army operates an **existing data center facility** with available rack space, power, cooling, and physical security
- The facility can provide standard power feeds (230V), cooling, and physical access control
- The application software (NAIPPS) is being developed separately by a dedicated team; this RFP covers **infrastructure only**
- The application is built on a **Ruby on Rails** backend with **PostgreSQL** database, **Redis** caching, and **Nginx** reverse proxy

---

## 2. Scope of Work

### 2.1 In Scope

Proposers must provide a complete, turnkey solution covering:

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | **Solution Design** | Detailed architecture, sizing calculations, rack layouts, network diagrams, and power/cooling requirements |
| 2 | **Hardware Procurement** | All servers, storage, networking equipment, racks, cabling, and accessories |
| 3 | **Shipping & Import** | International freight, customs clearance, import duties, insurance, and delivery to the data center facility in Abuja |
| 4 | **Physical Installation** | Racking, cabling, power connection, and labeling of all equipment |
| 5 | **Operating System & Platform** | Installation and configuration of server OS, database, caching, web server, and supporting software |
| 6 | **Network Configuration** | Firewall rules, VLAN segmentation, VPN, IDS/IPS, load balancing, and WAN connectivity |
| 7 | **Security Hardening** | Server hardening, encryption configuration, access controls, and baseline security audit |
| 8 | **Backup Configuration** | Automated backup system for database and files with defined RPO/RTO |
| 9 | **Testing & Commissioning** | Burn-in testing, load testing, failover testing, and formal acceptance testing |
| 10 | **Documentation** | Operations manual, network diagrams, runbooks, backup/recovery procedures, and asset register |
| 11 | **Training** | Knowledge transfer to Army IT staff covering system administration, database management, network operations, and security |
| 12 | **Warranty & Support** | Minimum 12-month post-commissioning support with defined SLA |

### 2.2 Out of Scope

The following are **not** included in this RFP and will not be evaluated:

- Application software development (handled separately)
- Building/facility construction or modification
- Generators, building-level UPS, or facility-wide cooling systems
- Physical perimeter security (fencing, guards, CCTV)
- Fire suppression systems
- WAN circuit procurement (monthly recurring connectivity costs)
- Ongoing operational staffing beyond the support period

---

## 3. System Requirements

### 3.1 User Population

| Category | Count |
|----------|-------|
| Active Duty Military Personnel | 230,000 |
| Reserve Personnel | 32,000 |
| Civilian Staff (Ministry of Defence) | 15,000 |
| **Total User Accounts** | **277,000** |

### 3.2 Growth Requirement

The infrastructure must support **20% annual growth in new hires** over a 5-year period without requiring full hardware replacement. Proposers must demonstrate how their solution scales incrementally.

### 3.3 Application Modules

The infrastructure must support the following 12 application modules:

| # | Module | Description | Criticality |
|---|--------|-------------|-------------|
| 1 | Authentication & Access Control | Login, role-based access (3 roles, 15 permissions), session management | CRITICAL |
| 2 | Payroll Processing | Monthly salary computation for all personnel — multiple earnings components (basic salary, housing, transport, special forces, hazard allowances) and deductions (PAYE tax, pension, welfare fund) | CRITICAL |
| 3 | Payslip Management | Historical payslip viewing, PDF generation and download, bulk upload, tax certificate generation | HIGH |
| 4 | Complaint/Ticket System | Filing, tracking, SLA management, escalation workflows, status updates, file attachments, audit timeline | HIGH |
| 5 | Personnel Records | Complete service records — rank, grade, corps, division, NIN, BVN, enlistment details, status tracking | CRITICAL |
| 6 | E-Learning Portal | Course catalog (6 departments, 20+ courses), content delivery (PDF, DOC, PPT, Video), progress tracking, clearance-based access | MEDIUM |
| 7 | Admin Dashboard | Real-time KPIs, ticket metrics, SLA monitoring, trend indicators | HIGH |
| 8 | Analytics & Reporting | Category distribution, monthly trends, division comparison, SLA compliance reporting | MEDIUM |
| 9 | User Management | Personnel CRUD operations, role assignment, status management, bulk operations | HIGH |
| 10 | Help & FAQ System | Knowledge base with contextual navigation | LOW |
| 11 | Profile Management | Service information display, PIN-protected sensitive data fields | HIGH |
| 12 | AWOL Management | Status tracking, dispute workflows, medical leave documentation | HIGH |

### 3.4 Performance Requirements

Proposers must demonstrate that their solution meets or exceeds the following performance targets:

| Metric | Requirement |
|--------|-------------|
| Peak concurrent users | Minimum 30,000 simultaneous sessions |
| Web page response time (p95) | < 200 milliseconds |
| Database query response time (p95) | < 50 milliseconds |
| Monthly payroll batch processing (277,000 records) | Completed within 4 hours |
| PDF generation (single payslip) | < 3 seconds |
| System availability | 99.9% uptime (excluding scheduled maintenance) |
| Planned failover (single server failure) | < 5 minutes automatic recovery |

### 3.5 Technology Stack

The application team has selected the following stack. The infrastructure must be optimised for:

| Layer | Technology |
|-------|-----------|
| Application Framework | Ruby on Rails 8 (monolith architecture) |
| Web Server | Puma (application) + Nginx (reverse proxy) |
| Database | PostgreSQL 16+ |
| Cache & Queue | Redis 7+ |
| Background Processing | Sidekiq 7+ |
| Operating System | Linux (Ubuntu Server LTS or equivalent) |
| Containerisation | Optional — Proposer may recommend if beneficial |

### 3.6 Security Requirements

| Requirement | Description |
|-------------|-------------|
| Network Segmentation | Application, database, storage, and management traffic must be on separate network segments |
| Firewall | Stateful packet inspection with IDS/IPS capability |
| Encryption at Rest | All personally identifiable information (PII) must be encrypted in the database |
| Encryption in Transit | All traffic must use TLS 1.2 or higher |
| VPN | Secure remote administration access |
| Access Control | Role-based access to infrastructure; all access logged |
| Compliance | Nigeria Data Protection Act (NDPA) 2023; NITDA guidelines |
| Audit Logging | All administrative actions on infrastructure must be logged and retained for minimum 2 years |

### 3.7 Backup & Recovery Requirements

| Parameter | Requirement |
|-----------|-------------|
| Recovery Point Objective (RPO) — Payroll & Personnel Data | ≤ 1 hour |
| Recovery Time Objective (RTO) — Critical Systems | ≤ 4 hours |
| Backup Retention — Daily | 30 days |
| Backup Retention — Monthly | 24 months |
| Backup Retention — Payroll Archives | 10 years (regulatory) |
| Offsite Backup | Required — encrypted copy at a geographically separate location |

### 3.8 Data Volume Estimates

| Data Type | Year 1 Estimate | Year 5 Estimate |
|-----------|----------------|-----------------|
| Personnel records | ~1 GB | ~3 GB |
| Payslip records (12 months × all users) | ~7 GB | ~16 GB |
| Complaint records & attachments | ~50 GB | ~255 GB |
| E-Learning content (PDF, DOC, PPT, Video) | ~500 GB | ~2,000 GB |
| Audit logs | ~48 GB | ~595 GB |
| Generated PDFs (payslips, certificates) | ~30 GB | ~150 GB |
| **Total (before replication/backup overhead)** | **~636 GB** | **~3,019 GB** |

---

## 4. Facility Information

### 4.1 Location

The equipment will be installed in the existing Nigerian Army data center located in **Abuja, Federal Capital Territory, Nigeria**. The exact address will be provided to shortlisted proposers upon execution of a Non-Disclosure Agreement (NDA).

### 4.2 Available Facility Infrastructure

The host data center provides:

- Rack space (quantity to be confirmed based on proposal requirements)
- Power feeds: 230V single-phase, metered circuits available per rack
- UPS protection on all power feeds
- Diesel generator backup with automatic transfer
- Precision cooling
- Physical access control (biometric)
- CCTV coverage
- Fire suppression (clean agent)
- Carrier cross-connects / fiber demarcation available

### 4.3 Proposer Responsibilities

Proposers must specify in their proposal:

- Total number of racks required
- Power draw per rack and total facility power requirement (kW)
- Cooling load (kW of heat rejection required)
- Any special facility requirements beyond what is listed above

---

## 5. Proposal Requirements

### 5.1 Proposal Structure

Proposals must be organised into the following sections:

| Section | Title | Description |
|---------|-------|-------------|
| A | **Executive Summary** | Overview of proposed solution, key differentiators, and total cost |
| B | **Company Profile** | Company background, relevant experience, certifications, and references |
| C | **Technical Solution** | Detailed architecture, hardware specifications, software stack, network design, security architecture, and backup strategy |
| D | **Sizing Justification** | Mathematical calculations demonstrating the proposed hardware meets performance requirements in Section 3.4 |
| E | **Bill of Materials** | Itemised list of all hardware, software, and services with individual pricing |
| F | **Implementation Plan** | Project timeline with milestones, resource plan, and dependencies |
| G | **Testing & Acceptance** | Proposed testing methodology, acceptance criteria, and sign-off process |
| H | **Training Plan** | Training curriculum, delivery method, duration, and number of staff to be trained |
| I | **Support & Warranty** | Post-commissioning support terms, SLA, escalation procedures, and warranty coverage |
| J | **Risk Register** | Identified risks with probability, impact, and mitigation strategies |
| K | **Commercial Proposal** | Total cost breakdown (CAPEX only), payment milestones, and validity period |
| L | **Scaling Roadmap** | How the solution accommodates 5-year growth without full replacement |

### 5.2 Mandatory Requirements

Proposals that do not address the following will be considered non-compliant:

1. All hardware must be **new, current-generation** equipment from established enterprise vendors (Dell, HPE, Lenovo, Supermicro, or equivalent)
2. All servers must include a minimum **3-year manufacturer warranty** with onsite support available in Nigeria
3. The solution must provide **high availability** — no single point of failure for critical services (application, database)
4. Database servers must have sufficient RAM to hold the entire active dataset in memory
5. Network must provide minimum **10 Gbps** internal bandwidth between servers
6. The proposer must have completed at least **3 comparable data center deployments** in the past 5 years
7. All pricing must be quoted in **USD** with a validity period of minimum **90 days**
8. The proposer must be able to handle all **import, customs clearance, and delivery** to Abuja

### 5.3 Desirable Requirements (Scored but Not Mandatory)

- Experience deploying infrastructure in Nigeria or West Africa
- Experience with military or government clients
- Ability to provide extended support (beyond 12 months)
- Open-source software expertise (Linux, PostgreSQL, Redis, Nginx)
- Ruby on Rails deployment experience
- Proposed disaster recovery or offsite replication solution
- Energy efficiency considerations and PUE optimisation
- Use of open-source alternatives to reduce licensing costs

---

## 6. Evaluation Criteria

Proposals will be evaluated on the following weighted criteria:

| # | Criterion | Weight | Description |
|---|-----------|--------|-------------|
| 1 | **Technical Solution Quality** | 35% | Architecture soundness, hardware specifications, sizing justification, security design, and fit for purpose |
| 2 | **Cost** | 25% | Total cost of ownership including hardware, services, import, and support. Value for money. |
| 3 | **Company Experience & Capability** | 15% | Track record, relevant references, team qualifications, and ability to execute in Nigeria |
| 4 | **Implementation Plan** | 10% | Realistic timeline, clear milestones, risk mitigation, and dependency management |
| 5 | **Support & Warranty** | 10% | Quality of post-deployment support, SLA terms, response times, and escalation procedures |
| 6 | **Training & Knowledge Transfer** | 5% | Comprehensiveness of training plan and quality of documentation |

### 6.1 Evaluation Process

1. **Compliance Check** — Proposals screened against mandatory requirements (pass/fail)
2. **Technical Evaluation** — Compliant proposals scored against criteria 1, 3, 4, 5, 6
3. **Commercial Evaluation** — Cost proposals opened and scored against criterion 2
4. **Shortlisting** — Top 3-5 proposers invited for presentation and Q&A
5. **Final Selection** — Award based on combined technical and commercial score
6. **Contract Negotiation** — Terms and conditions finalised with selected proposer

---

## 7. Commercial Terms

### 7.1 Pricing

- All prices must be quoted in **United States Dollars (USD)**
- Prices must include all hardware, software licenses, shipping, import duties, VAT, customs clearance, insurance, delivery, installation, configuration, testing, documentation, training, and support for the specified warranty period
- No hidden costs — the quoted price must be the total the Army pays to receive a production-ready system
- Proposals should clearly separate:
  - Equipment cost (hardware + software licenses)
  - Shipping, import & logistics
  - Installation & configuration services
  - Training
  - Support & warranty

### 7.2 Payment Terms

Payment will be milestone-based:

| Milestone | Payment % | Trigger |
|-----------|-----------|---------|
| Contract Award | 20% | Signed contract |
| Equipment Delivery to Site | 30% | All equipment delivered and verified against BOM |
| Installation Complete | 20% | Hardware installed, powered on, and passing burn-in tests |
| Acceptance Testing | 20% | System passes all acceptance tests as defined in proposal |
| Training & Handover | 10% | Training completed, documentation delivered, formal handover signed |

### 7.3 Contract Duration

- Implementation phase: maximum **12 months** from contract award to full handover
- Support phase: minimum **12 months** post-handover
- Total contract duration: **24 months**

---

## 8. Submission Instructions

### 8.1 Submission Format

- Proposals must be submitted in **English**
- Technical and commercial proposals must be in **separate sealed envelopes** (or separate electronic files)
- Electronic submissions accepted in **PDF format** via email to [INSERT EMAIL]
- Hard copy submissions (3 copies) delivered to [INSERT ADDRESS]

### 8.2 Submission Deadline

**[INSERT DATE AND TIME]**

Late submissions will not be considered.

### 8.3 Clarification Questions

- Questions must be submitted in writing to [INSERT EMAIL] by **[INSERT DATE — recommend 3 weeks before deadline]**
- Responses will be issued to all registered proposers simultaneously
- No oral clarifications will be binding

### 8.4 Site Visit

A **mandatory site visit** to the data center facility will be arranged for registered proposers on **[INSERT DATE]**. Proposers must register their attendance by **[INSERT DATE]** via [INSERT EMAIL]. Attendance requires execution of a Non-Disclosure Agreement (NDA).

### 8.5 Proposal Validity

Proposals must remain valid for a minimum of **90 days** from the submission deadline.

---

## 9. Terms & Conditions

### 9.1 Confidentiality

All information contained in this RFP and obtained during site visits is **RESTRICTED**. Proposers must not disclose any information to third parties without written authorisation. All proposers will be required to sign a Non-Disclosure Agreement (NDA).

### 9.2 Intellectual Property

- All documentation, configurations, and scripts developed specifically for this project become the property of the Nigerian Army upon delivery
- Proposers retain IP rights to their proprietary tools and methodologies

### 9.3 Right to Reject

The Nigerian Army reserves the right to:
- Reject any or all proposals without obligation or explanation
- Award the contract to a proposer other than the lowest bidder
- Cancel this RFP at any time
- Request additional information or clarification from any proposer
- Negotiate final terms with the selected proposer

### 9.4 Compliance

All work must comply with:
- Nigeria Data Protection Act (NDPA) 2023
- NITDA Guidelines for Government IT Procurement
- Applicable Nigerian customs and import regulations

### 9.5 Insurance

The selected proposer must maintain:
- Professional indemnity insurance: minimum $500,000
- Marine/transit insurance for all equipment during shipping and delivery
- Public liability insurance for work performed at the data center site

---

## 10. Key Dates Summary

| Event | Date |
|-------|------|
| RFP Issued | [INSERT] |
| NDA Execution Deadline (for site visit) | [INSERT] |
| Mandatory Site Visit | [INSERT] |
| Deadline for Clarification Questions | [INSERT] |
| Clarification Responses Issued | [INSERT] |
| Proposal Submission Deadline | [INSERT] |
| Technical Evaluation | [INSERT] |
| Shortlist Notification | [INSERT] |
| Presentations & Q&A | [INSERT] |
| Contract Award (target) | [INSERT] |
| Contract Signature (target) | [INSERT] |
| Project Kickoff (target) | [INSERT] |

---

## 11. Contact Information

| Role | Name | Contact |
|------|------|---------|
| Procurement Lead | [INSERT] | [INSERT email and phone] |
| Technical Lead | [INSERT] | [INSERT email and phone] |
| Administrative Queries | [INSERT] | [INSERT email and phone] |

---

## Annexes

### Annex A — Proposer Registration Form

Firms intending to submit a proposal must register by sending the following details to [INSERT EMAIL]:

- Company name and registration number
- Contact person name, title, email, and phone number
- Brief description of relevant experience (max 500 words)
- Confirmation of intent to attend the mandatory site visit

### Annex B — NDA Template

[To be provided upon request]

### Annex C — Draft Contract Terms

[To be provided to shortlisted proposers]

### Annex D — Application Architecture Reference

The NAIPPS application uses the following architecture. Proposers should optimise their infrastructure design accordingly:

```
Client Layer:       React (Single Page Application) + React Native (Mobile)
                              │
Reverse Proxy:      Nginx (SSL termination, static assets, load balancing)
                              │
Application:        Ruby on Rails 8 (Puma web server, monolith architecture)
                              │
Background Jobs:    Sidekiq (payroll processing, PDF generation, bulk operations)
                              │
Cache & Queue:      Redis (session cache, Sidekiq job queue, fragment caching)
                              │
Database:           PostgreSQL 16 (primary + streaming replica)
                              │
File Storage:       ActiveStorage (attachments, e-learning content, generated PDFs)
```

**Key workload characteristics:**
- Read-heavy application (~90% reads, ~10% writes during normal operations)
- Write-heavy during monthly payroll batch (overnight, ~4 hour window)
- PDF generation is CPU-bound (server-side rendering)
- E-learning content delivery is storage I/O bound (large file serving)
- Database performance is memory-bound (entire working set should fit in RAM)

---

*End of RFP Document*

*This document is the property of the Nigerian Army. Unauthorised reproduction or distribution is prohibited.*
