# Nigerian Army Integrated Personnel & Payroll System (NAIPPS)
# Infrastructure & Hardware Procurement Plan

**Document Version:** 7.0  
**Date:** 2 April 2026  
**Architecture:** Ruby on Rails monolith, PostgreSQL, Redis, Nginx  
**Scope:** Hardware, networking, storage, import/shipping, installation. No application development costs.  
**Philosophy:** Open source software. **New** enterprise hardware. Zero waste.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Server Hardware](#3-server-hardware)
4. [Storage](#4-storage)
5. [Networking & Security](#5-networking--security)
6. [Racks, Power & Cabling](#6-racks-power--cabling)
7. [Import & Shipping to Nigeria](#7-import--shipping-to-nigeria)
8. [Professional Services & Training](#8-professional-services--training)
9. [Complete Bill of Materials](#9-complete-bill-of-materials)
10. [Final Cost Summary](#10-final-cost-summary)
11. [What We Cut and Why](#11-what-we-cut-and-why)
12. [Rack Layout & Power Draw](#12-rack-layout--power-draw)
13. [Performance Projections](#13-performance-projections)
14. [Scaling Path](#14-scaling-path)
15. [Backup Strategy](#15-backup-strategy)
16. [Facility Requirements](#16-facility-requirements)
17. [Implementation Timeline](#17-implementation-timeline)
18. [Risk Register](#18-risk-register)

---

## 1. Executive Summary

This is the **infrastructure-only** cost to bring NAIPPS online inside the existing Nigerian Army data center. Application development is handled separately by the in-house team. **All servers are brand-new, current-generation hardware with full manufacturer warranty.**

**The Number: $133,766 USD (NGN 207.3M)**

| Category | Cost |
|----------|------|
| Servers (4× **new** Dell PowerEdge R760xs) | $68,000 |
| Storage (NAS + 10× enterprise drives) | $6,700 |
| Networking & Security (MikroTik + pfSense) | $3,818 |
| Racks, PDUs, UPS, cabling | $11,810 |
| Import, shipping, customs to Nigeria | $15,588 |
| Professional services & training | $21,800 |
| Contingency (5%) | $6,050 |
| **TOTAL** | **$133,766** |

**What this buys:**
- 4 **brand-new** Dell PowerEdge R760xs servers — 192 total CPU cores, 1.5 TB total RAM, DDR5, PCIe Gen5, 3-year Dell ProSupport warranty
- 108 TB usable NAS storage + 15 TB NVMe database storage per node
- 10 Gbps internal network (MikroTik spine)
- Firewall with IDS/IPS and VPN (pfSense HA pair)
- 3 racks with rack-mount UPS, metered PDUs, and full cabling
- Everything shipped, cleared customs, installed, tested, and handed over
- Total power draw: **6.5 kW**

Serves **277,000 users** with 3.5× capacity headroom at peak. Expandable to 500,000+ users by adding servers.

### Why New Servers

| Factor | Refurbished (previous version) | New (this version) |
|--------|-------------------------------|-------------------|
| Server cost (4 units) | $24,600 | $68,000 |
| Total project cost | $83,936 | **$133,766** |
| Warranty | 1-year third-party | **3-year Dell ProSupport (onsite, next-business-day)** |
| CPU generation | 3rd-gen Xeon (2021) | **4th-gen Xeon Scalable (2023, current)** |
| Memory | DDR4-3200 | **DDR5-4800 (50% faster)** |
| PCIe | Gen 4 | **Gen 5 (2× I/O bandwidth)** |
| Security | Standard | **Dell Secured Component Verification, TPM 2.0** |
| Expected lifespan | 4-6 more years | **7-10 years** |
| Dell support in Nigeria | None (third-party only) | **Dell has Lagos & Abuja offices — onsite support** |
| Power efficiency | ~15% less efficient | **Latest-gen power management** |

The $43,400 premium buys current-gen hardware, manufacturer warranty with on-site support in Nigeria, and double the remaining useful life.

---

## 2. Architecture Overview

### 2.1 The Stack

```
┌──────────────────────────────────────────────────┐
│                   CLIENTS                         │
│     Browser (React)  │  Mobile (React Native)     │
└──────────────┬───────────────────┬────────────────┘
               │                   │
        ┌──────┴───────────────────┴──────┐
        │     Nginx (reverse proxy + LB)  │
        │     SSL termination, gzip       │
        └──────┬───────────────────┬──────┘
               │                   │
        ┌──────┴──────┐    ┌──────┴──────┐
        │  Rails App  │    │  Rails App  │
        │  Server 1   │    │  Server 2   │
        │  Puma       │    │  Puma       │
        │  + Sidekiq  │    │  + Sidekiq  │
        │  + Redis    │    │  + Redis    │
        └──────┬──────┘    └──────┬──────┘
               │                   │
        ┌──────┴───────────────────┴──────┐
        │    PostgreSQL Primary (DB 1)    │
        │         │  streaming replication│
        │    PostgreSQL Replica (DB 2)    │
        └─────────────────────────────────┘
               │
        ┌──────┴──────┐
        │  Synology   │
        │  NAS (files │
        │  + backups) │
        └─────────────┘
```

### 2.2 What Runs Where

| Process | Where It Runs | RAM Used | CPU Used |
|---------|--------------|----------|----------|
| Puma (Rails web server, 16 workers × 5 threads) | App Server 1 & 2 | 8-16 GB | 16 cores |
| Sidekiq (background jobs — payroll, PDFs, bulk ops) | App Server 1 & 2 | 2-4 GB | 4 cores |
| Redis (cache + Sidekiq queue) | App Server 1 & 2 | 2-4 GB | 1 core |
| Nginx (reverse proxy, static assets) | App Server 1 & 2 | 0.5 GB | 1 core |
| PostgreSQL Primary (all writes) | DB Server 1 | 256+ GB | All cores |
| PostgreSQL Replica (reads, reporting, failover) | DB Server 2 | 256+ GB | All cores |

No separate servers needed for Redis, Nginx, Sidekiq, monitoring, logging, backup, auth, or management. They all share the app servers. This is how Rails monoliths work in production at companies like Basecamp, Shopify, and GitHub.

### 2.3 Performance Math

```
Total users:                    277,000
Peak concurrent (10%):          27,700
Requests per concurrent user:   1 request every 30 seconds
Peak requests/second:           923 req/s

Puma capacity per server:       16 workers × 5 threads / 50ms avg = 1,600 req/s
2 app servers total:            3,200 req/s capacity
Headroom:                       3.5× over peak demand ✓

Month-end payroll spike (25% concurrent):
  Requests/second:              2,308 req/s
  Still within 3,200 capacity ✓ (72% utilization)

PostgreSQL:
  Active dataset (Year 1):      ~32 GB
  shared_buffers:               128 GB
  Entire DB fits in RAM:        YES ✓ → sub-5ms query times

Sidekiq payroll batch:
  277,000 records:              ~33 minutes
  689,000 records (Year 5):     ~83 minutes
  Both well within overnight window ✓
```

---

## 3. Server Hardware

### 3.1 Why Dell PowerEdge R760xs (New)

The Dell PowerEdge R760xs is Dell's **cost-optimized current-generation** 2U server — same 4th-gen Intel Xeon Scalable platform as the flagship R760, but with a streamlined design that cuts cost without sacrificing performance for our workload. It supports up to 2 processors, 16 DDR5 DIMM slots (up to 1 TB), and PCIe Gen 5.

Sources: [Dell R760xs configurator](https://www.dell.com/en-us/shop/ipovw/poweredge-r760xs), [IT Pro review](https://www.itpro.com/infrastructure/servers-and-storage/dell-poweredge-r760xs-review-a-right-sized-xeon-scalable-gen-4-server), [ServerMall](https://servermall.com/sets/dell-poweredge-r760xs-server/)

**Pricing basis:** Dell R760xs new server pricing starts at ~€3,000-€6,000 for base chassis. Fully configured with our specs (dual Xeon, 256-512GB DDR5, NVMe storage), pricing is approximately $12,000-$22,000 per unit based on Dell configurator and reseller quotes (CDW, Insight, ServerMall). Dell's Africa/MEA sales team can provide Nigeria-specific pricing. Supermicro equivalent would be 10-15% cheaper per [slyd.com comparison](https://slyd.com/resources/server-comparison).

### 3.2 App Servers (×2)

Each runs: Nginx + Puma (Rails) + Sidekiq + Redis. If one dies, the other handles 100% of traffic.

| Spec | Detail |
|------|--------|
| Model | **Dell PowerEdge R760xs (NEW)** |
| CPU | 2× Intel Xeon Gold 5416S (16 cores each = **32 cores**) |
| RAM | **256 GB** DDR5-4800 ECC (8× 32 GB DIMMs) |
| Boot/OS | BOSS-N1 module (2× 480 GB M.2 NVMe, RAID 1) |
| App Storage | 2× 1.92 TB NVMe SSD (RAID 1 — Rails app, logs, tmp) |
| NIC | 2× 10 GbE SFP+ (broadcom OCP) + 1× 1 GbE (iDRAC dedicated) |
| PSU | 2× 800W redundant (80+ Titanium) |
| RAID | PERC H965i |
| iDRAC | 9 Enterprise (remote management, Secured Component Verification) |
| Form | 2U |
| Warranty | **3-year Dell ProSupport (onsite, next-business-day)** |
| **Price** | **$12,000** |

**RAM breakdown:** Puma uses ~5 GB, Sidekiq ~1.2 GB, Redis ~4 GB, Nginx ~0.5 GB, OS ~4 GB = **~15 GB used**. Remaining 241 GB becomes Linux page cache — every file, every asset cached in RAM. Zero disk I/O. DDR5-4800 is 50% faster than DDR4-3200 for memory-intensive operations.

### 3.3 Database Servers (×2)

PostgreSQL primary + streaming replica. Entire database runs from memory.

| Spec | Detail |
|------|--------|
| Model | **Dell PowerEdge R760xs (NEW, high-memory config)** |
| CPU | 2× Intel Xeon Gold 6430 (32 cores each = **64 cores**) |
| RAM | **512 GB** DDR5-4800 ECC (16× 32 GB DIMMs) |
| Database Storage | 4× 3.84 TB NVMe SSD (RAID 10 = **7.68 TB usable**) |
| WAL/Backup | 2× 1.92 TB NVMe SSD (RAID 1 — WAL archive, local backups) |
| NIC | 2× 10 GbE SFP+ (broadcom OCP) + 1× 1 GbE (iDRAC dedicated) |
| PSU | 2× 1100W redundant (80+ Titanium) |
| RAID | PERC H965i |
| iDRAC | 9 Enterprise |
| Form | 2U |
| Warranty | **3-year Dell ProSupport (onsite, next-business-day)** |
| **Price** | **$22,000** |

**Why 512 GB RAM:** PostgreSQL shared_buffers set to 128 GB. Year 1 active dataset is ~32 GB. Year 5 dataset (~620 GB) still fits within the 7.68 TB NVMe array. Every query is a memory lookup → sub-5ms response times. DDR5 further improves sequential scan performance.

### 3.4 Server Summary

| Role | Qty | Unit $ | Total $ |
|------|-----|--------|---------|
| App Server (32-core, 256 GB DDR5, 2×1.92TB NVMe) | 2 | $12,000 | $24,000 |
| DB Server (64-core, 512 GB DDR5, 4×3.84TB + 2×1.92TB NVMe) | 2 | $22,000 | $44,000 |
| **TOTAL SERVERS** | **4** | | **$68,000** |

### 3.5 Alternative Vendors (If Dell Pricing Is Unfavorable)

| Vendor | App Server Equiv. | DB Server Equiv. | Notes |
|--------|------------------|-----------------|-------|
| **HPE ProLiant DL380 Gen11** | ~$13,000 | ~$23,000 | [HPE Store](https://buy.hpe.com/us/en/compute/rack-servers/proliant-dl300-servers/hpe-proliant-dl380-gen11/p/1014696069). Strong in Nigeria via HPE partners. |
| **Lenovo ThinkSystem SR650 V3** | ~$11,000 | ~$21,000 | [Lenovo](https://www.lenovo.com/us/en/p/servers-storage/servers/racks/thinksystem-sr650-v3/len21ts0013). Competitive pricing, good value. |
| **Supermicro Ultra SYS-220U** | ~$10,000 | ~$19,000 | [Supermicro eStore](https://store.supermicro.com/us_en/systems/rackmount/rackmount-2u/2u-dp-rack-servers.html). 10-15% cheaper, 2-4 week lead time, needs more ops expertise. |

Supermicro would bring total server cost to ~$58,000 (saving $10,000). All vendors offer comparable specs and 3-year warranties.

---

## 4. Storage

No enterprise SAN. No tape library. A Synology rackmount NAS for file storage (e-learning content, complaint attachments, PDFs, backups). Database lives on server-local NVMe.

### 4.1 Equipment

| # | Component | Spec | Qty | Unit $ | Total $ |
|---|-----------|------|-----|--------|---------|
| 1 | NAS | Synology RS2423RP+ (12-bay rackmount, redundant PSU) | 1 | $2,500 | $2,500 |
| 2 | Drives | Seagate Exos X18 18TB (enterprise, 7200RPM, 5yr warranty) | 8 | $400 | $3,200 |
| 3 | Spare Drives | Seagate Exos X18 18TB (shelf spares for hot-swap) | 2 | $400 | $800 |
| 4 | RAM Upgrade | 16 GB DDR4 ECC SO-DIMM for NAS | 1 | $100 | $100 |
| 5 | 10GbE NIC | Synology E10G22-T1-Mini | 1 | $100 | $100 |
| | **TOTAL STORAGE** | | | | **$6,700** |

Drive pricing source: [Newegg — Seagate Exos X18](https://www.newegg.com/seagate-exos-x18-st18000nm000j-18tb/p/1B4-00VK-00616), wholesale $389-$420/unit Q1 2026

**Capacity:**
```
8× 18 TB = 144 TB raw
SHR-2 (dual parity): 108 TB usable
2 drives can fail simultaneously → zero data loss ✓
Year 5 total usage: ~15 TB of 108 TB = 14% utilized ✓
4 empty bays for future expansion (add drives, no new hardware)
```

---

## 5. Networking & Security

### 5.1 The Math on Why This Works

- Cisco Nexus 93180YC → MikroTik CRS326: same 10G switching, **$500 vs $20,000**
- Palo Alto PA-5250 → pfSense Netgate 6100: same firewall job, **$999 vs $80,000**
- F5 BIG-IP → Nginx: same load balancing, **free vs $55,000**
- Cisco IDS/IPS → Suricata on pfSense: same threat detection, **free vs $30,000**

### 5.2 Network Diagram

```
        ┌────────────┐  ┌────────────┐
        │  WAN Link  │  │  WAN Link  │
        │  (Primary) │  │ (Backup)   │
        └─────┬──────┘  └─────┬──────┘
              └───────┬───────┘
              ┌───────┴───────┐
              │   pfSense HA  │ Netgate 6100 ×2
              │   FW + IDS +  │ CARP failover
              │   VPN         │
              └───────┬───────┘
                      │ 10 GbE
              ┌───────┴───────┐
              │   MikroTik    │ CRS326-24S+2Q+RM ×2
              │   10G Switch  │ 24× 10G SFP+
              └──┬──┬──┬──┬──┘
                 │  │  │  │
              App1 App2 DB1 DB2  NAS
```

### 5.3 Equipment

| # | Component | Model | Qty | Unit $ | Total $ |
|---|-----------|-------|-----|--------|---------|
| 1 | Core Switch | MikroTik CRS326-24S+2Q+RM (24×10G + 2×40G) | 1 | $500 | $500 |
| 2 | Backup Switch | MikroTik CRS326-24S+2Q+RM (redundancy) | 1 | $500 | $500 |
| 3 | Firewall (Primary) | Netgate 6100 MAX pfSense+ (2×10G, 4×2.5G, 8GB) | 1 | $999 | $999 |
| 4 | Firewall (Backup) | Netgate 6100 MAX pfSense+ (CARP HA) | 1 | $999 | $999 |
| 5 | Management Switch | MikroTik CRS112-8P-4S-IN (8-port GbE + 4 SFP) | 1 | $180 | $180 |
| 6 | 10G SFP+ DAC Cables | 0.5m-3m direct-attach copper | 12 | $15 | $180 |
| 7 | 10G SFP+ Transceivers | Firewall-to-switch links | 4 | $25 | $100 |
| 8 | Cat6A Patch Cables | Various lengths | 30 | $8 | $240 |
| 9 | Fiber Patch Cables | LC-LC OM4 | 10 | $12 | $120 |
| | **TOTAL NETWORKING** | | | | **$3,818** |

Sources: [MikroTik CRS326](https://mikrotik.com/product/crs326_24s_2q_rm) (~$500), [Netgate 6100 MAX](https://shop.netgate.com/products/6100-max-pfsense) ($999)

### 5.4 VLAN Segmentation

| VLAN | Subnet | Purpose |
|------|--------|---------|
| VLAN 10 | 10.10.10.0/24 | Application servers |
| VLAN 20 | 10.10.20.0/24 | Database servers |
| VLAN 30 | 10.10.30.0/24 | Storage (NAS) |
| VLAN 40 | 10.10.40.0/24 | Management (iDRAC) |
| VLAN 50 | 10.10.50.0/24 | DMZ (firewall uplink) |

### 5.5 Security Stack (All Free / Included)

| Layer | Tool | Cost |
|-------|------|------|
| Firewall | pfSense (stateful packet inspection) | Included |
| IDS/IPS | Suricata (ET Open rules) | Free |
| VPN | WireGuard + OpenVPN | Free |
| WAF | Rack::Attack (Rails gem) + Nginx rate limiting | Free |
| SSL/TLS | Let's Encrypt | Free |
| DNS Filtering | pfBlockerNG | Free |
| Server Hardening | CIS Benchmark scripts for Ubuntu | Free |
| DB Encryption | PostgreSQL pgcrypto (PII at rest) | Free |

---

## 6. Racks, Power & Cabling

### 6.1 Equipment

| # | Component | Qty | Unit $ | Total $ |
|---|-----------|-----|--------|---------|
| 1 | Server Rack (42U, 600×1070mm) | 3 | $1,200 | $3,600 |
| 2 | Metered PDU (16A 230V, C13/C19, A+B per rack) | 6 | $400 | $2,400 |
| 3 | Rack-mount UPS (3 kVA, online, 2U) | 2 | $1,800 | $3,600 |
| 4 | UPS Extended Battery Pack | 2 | $500 | $1,000 |
| 5 | Blanking Panels (1U) | 30 | $8 | $240 |
| 6 | Cable Management (vertical, per rack) | 3 | $80 | $240 |
| 7 | KVM-over-IP (remote console) | 1 | $500 | $500 |
| 8 | Rack-mount shelf (for firewalls) | 2 | $40 | $80 |
| 9 | Grounding kit | 3 | $30 | $90 |
| 10 | Labels, ties, velcro, misc | Lot | — | $60 |
| | **TOTAL RACKS & POWER** | | | **$11,810** |

---

## 7. Import & Shipping to Nigeria

Total equipment weight: ~300 kg (4 servers + NAS + drives + switches + firewalls + racks + UPS). Fits in 2 pallets.

| Item | Basis | Cost $ |
|------|-------|--------|
| International shipping (air freight, 2 pallets) | ~$10/kg × 350 kg | $3,500 |
| Import duty (IT equipment, 5% of CIF) | 5% of $93,828 | $4,691 |
| VAT (7.5% of CIF + duty) | 7.5% of $98,519 | $7,389 |
| Customs clearing agent | Fixed fee | $800 |
| Port handling & inspection | Fixed fee | $500 |
| Local transport (Lagos → Abuja) | Truck | $500 |
| **TOTAL IMPORT & LOGISTICS** | | **$17,380** |

Sources: [Nigeria import tariffs](https://www.trade.gov/country-commercial-guides/nigeria-import-tariffs), [Nigeria customs calculator](https://www.smepayroll.com.ng/calculator/importduty/)

**Note:** IT equipment (HS code 8471.xx) attracts 5% duty. Military procurement channels may reduce or waive duties entirely.

---

## 8. Professional Services & Training

| # | Service | Description | Cost $ |
|---|---------|-------------|--------|
| 1 | Installation | Server racking, cabling, OS install, PostgreSQL setup, burn-in testing | $5,000 |
| 2 | Network Configuration | pfSense setup, VLANs, IDS/IPS rules, VPN, firewall rules | $3,000 |
| 3 | Training | Linux admin, PostgreSQL DBA, Rails deployment, security (4 staff, online courses + labs) | $6,000 |
| 4 | Documentation | Runbooks, backup procedures, ops manual, network diagrams | $3,000 |
| 5 | Load Testing | k6/Locust load test at scale, performance tuning | $2,000 |
| 6 | Security Hardening | CIS benchmarks, pfSense audit, PostgreSQL hardening | $2,800 |
| | **TOTAL SERVICES** | | **$21,800** |

---

## 9. Complete Bill of Materials

| Line | Category | Item | Qty | Unit $ | Total $ |
|------|----------|------|-----|--------|---------|
| **SERVERS** | | | | | |
| 1 | App Server | Dell R760xs NEW (32-core, 256GB DDR5, 2×1.92TB NVMe, 3yr ProSupport) | 2 | $12,000 | $24,000 |
| 2 | DB Server | Dell R760xs NEW (64-core, 512GB DDR5, 4×3.84TB + 2×1.92TB NVMe, 3yr ProSupport) | 2 | $22,000 | $44,000 |
| | | **Servers Subtotal** | **4** | | **$68,000** |
| **STORAGE** | | | | | |
| 3 | NAS | Synology RS2423RP+ (12-bay, redundant PSU) | 1 | $2,500 | $2,500 |
| 4 | Drives | Seagate Exos X18 18TB | 8 | $400 | $3,200 |
| 5 | Spares | Seagate Exos X18 18TB (shelf) | 2 | $400 | $800 |
| 6 | RAM | 16GB DDR4 ECC SO-DIMM | 1 | $100 | $100 |
| 7 | NIC | Synology 10GbE adapter | 1 | $100 | $100 |
| | | **Storage Subtotal** | | | **$6,700** |
| **NETWORK** | | | | | |
| 8 | Switch | MikroTik CRS326-24S+2Q+RM (24×10G) | 2 | $500 | $1,000 |
| 9 | Firewall | Netgate 6100 MAX pfSense+ | 2 | $999 | $1,998 |
| 10 | Mgmt Switch | MikroTik CRS112-8P-4S-IN | 1 | $180 | $180 |
| 11 | Cables/Optics | DAC (12), SFP+ (4), Cat6A (30), Fiber (10) | Lot | — | $640 |
| | | **Network Subtotal** | | | **$3,818** |
| **RACKS & POWER** | | | | | |
| 12 | Racks | 42U server rack | 3 | $1,200 | $3,600 |
| 13 | PDUs | Metered PDU 16A 230V (×2 per rack) | 6 | $400 | $2,400 |
| 14 | UPS | Rack-mount 3kVA online (2U) | 2 | $1,800 | $3,600 |
| 15 | Battery | Extended runtime module | 2 | $500 | $1,000 |
| 16 | Accessories | Blanking panels, cable mgmt, KVM-IP, shelves, grounding, misc | Lot | — | $1,210 |
| | | **Racks Subtotal** | | | **$11,810** |
| | | | | | |
| | | **ALL HARDWARE** | | | **$90,328** |
| | | | | | |
| **SERVICES** | | | | | |
| 17 | Install | Racking, cabling, OS, DB, burn-in | Lot | — | $5,000 |
| 18 | Network Config | pfSense, VLANs, IDS, VPN | Lot | — | $3,000 |
| 19 | Training | 4 staff, Linux/PostgreSQL/Rails/Security | 4 seats | $1,500 | $6,000 |
| 20 | Documentation | Runbooks, ops manual, diagrams | Lot | — | $3,000 |
| 21 | Load Testing | k6/Locust at scale, tuning | Lot | — | $2,000 |
| 22 | Security | CIS hardening, audit | Lot | — | $2,800 |
| | | **Services Subtotal** | | | **$21,800** |
| **LOGISTICS** | | | | | |
| 23 | Import | Duty + VAT + shipping + clearing + transport | Lot | — | $17,380 |
| | | | | | |
| | | **GRAND SUBTOTAL** | | | **$129,508** |
| 24 | Contingency | 5% for price variance, forex | — | — | $6,475 |
| | | | | | |
| | | **GRAND TOTAL** | | | **$135,983** |

---

## 10. Final Cost Summary

```
$135,983 — Infrastructure Only (New Servers, No App Development)
════════════════════════════════════════════════════════════════

Servers (4× NEW R760xs)      █████████████████████████████████████████████████  50.0%  $68,000
Import & Shipping            █████████████                                     12.8%  $17,380
Services & Training          ████████████████                                  16.0%  $21,800
Racks, UPS, Power            █████████                                          8.7%  $11,810
Storage (NAS + drives)       █████                                              4.9%   $6,700
Contingency (5%)             █████                                              4.8%   $6,475
Network & Security           ███                                                2.8%   $3,818
                             ──────────────────────────────────────────────────────────
                             TOTAL: $135,983 USD / NGN 210.8M
```

### Cost Per User

| Metric | Value |
|--------|-------|
| Total infrastructure cost | $135,983 |
| Users served | 277,000 |
| **Cost per user** | **$0.49 / NGN 761** |

---

## 11. What We Cut and Why

| Enterprise Option | What We Use Instead | Saved |
|---|---|---|
| Dell PowerStore SAN ($320K) | Server-local NVMe + Synology NAS | **$313,300** |
| Cisco Nexus switches ($171K) | MikroTik CRS326 10G ($1K) | **$170,000** |
| Palo Alto firewalls ($160K) | pfSense Netgate 6100 ($2K) | **$158,000** |
| F5 BIG-IP load balancers ($135K) | Nginx (free, on app servers) | **$135,000** |
| Cisco IDS/IPS ($60K) | Suricata on pfSense (free) | **$60,000** |
| Cisco VPN ($36K) | WireGuard on pfSense (free) | **$36,000** |
| Dell Data Domain + tape ($157K) | pg_dump + rsync to NAS (free) | **$157,000** |
| DR site ($254K) | Offsite encrypted backups ($145/yr) | **$254,000** |
| 35 new premium servers ($591K) | 4 new budget servers ($68K) | **$523,000** |
| VMware ($113K/yr) | Bare metal Linux (free) | **$113,000** |

---

## 12. Rack Layout & Power Draw

```
3 Racks — Complete Layout
══════════════════════════════════════════════

Rack 1: COMPUTE              Rack 2: DATA               Rack 3: NETWORK
┌────────────────┐           ┌────────────────┐         ┌────────────────┐
│ [U1-2] App 1   │ 1.2 kW   │ [U1-2] DB 1    │ 1.8 kW │ [U1] Core SW   │ 40W
│ [U3-4] App 2   │ 1.2 kW   │ [U3-4] DB 2    │ 1.8 kW │ [U2] Backup SW │ 40W
│ [U5-6] UPS 1   │          │ [U5-6] NAS     │ 0.3 kW │ [U3] FW 1      │ 40W
│ [U7-42] EMPTY  │          │ [U7-8] UPS 2   │        │ [U4] FW 2      │ 40W
│                │           │ [U9-42] EMPTY  │         │ [U5] Mgmt SW   │ 20W
│                │           │                │         │ [U6] KVM-IP    │ 15W
│                │           │                │         │ [U7-42] EMPTY  │
└────────────────┘           └────────────────┘         └────────────────┘
  2.4 kW                      3.9 kW                     0.2 kW

TOTAL POWER DRAW: 6.5 kW
```

**6.5 kW total** — less than two electric ovens. Any data center can provide this.

---

## 13. Performance Projections

### Response Times

| Operation | Expected |
|-----------|----------|
| Page load (cached) | < 50 ms |
| Page load (uncached) | < 200 ms |
| Payslip view | < 100 ms |
| Complaint filing | < 300 ms |
| PDF download | < 2 seconds |
| Personnel search | < 100 ms |
| Admin dashboard | < 500 ms |
| Payroll batch (277K records) | ~33 minutes |
| Payroll batch (689K, Year 5) | ~83 minutes |

### Capacity vs Demand

| Metric | Capacity | Peak Demand | Headroom |
|--------|----------|-------------|----------|
| Concurrent users | 50,000+ | 27,700 | 1.8× |
| Requests/second | 3,200 | 923 | 3.5× |
| DB queries/second | 50,000+ | 5,000 | 10× |
| File storage | 108 TB | 15 TB (Year 5) | 7.2× |
| DB storage | 7.68 TB per node | 620 GB (Year 5) | 12× |

---

## 14. Scaling Path

| Trigger | Solution | Cost | When |
|---------|----------|------|------|
| App CPU > 70% sustained | Add 1 new R760xs app server | $12,000 | Year 2-3 |
| DB queries slowing (>100ms p95) | Add 1 read replica | $22,000 | Year 3-4 |
| NAS storage > 70% | Add 4 more 18TB drives (4 empty bays) | $1,600 | Year 3-4 |
| 500K+ users | Add 2 app + 1 DB server | $46,000 | Year 4-5 |

**Year 5 total spend (including expansions): ~$215,000**

---

## 15. Backup Strategy

### Database

```
├── Continuous:    WAL streaming to replica (RPO: 0 seconds)
├── Hourly:        WAL archive to NAS (/backups/wal/)
├── Nightly:       pg_dump full backup to NAS (/backups/daily/)
├── Weekly:        pg_basebackup to NAS (/backups/weekly/)
└── Monthly:       Encrypted copy to external drive → offsite storage
```

### Files

```
├── Continuous:    Synology snapshots every 4 hours
├── Nightly:       rsync critical files to DB Server 2
└── Monthly:       Encrypted archive to external USB drive → offsite
```

### Retention

| Backup Type | Keep For |
|-------------|----------|
| Daily pg_dump | 30 days |
| Weekly pg_basebackup | 12 weeks |
| Monthly offsite | Indefinite (payroll = regulatory requirement) |

### Recovery

If all servers destroyed:
1. Order 4 new servers ($68,000, 2-4 week delivery via Dell)
2. Install OS + stack via Ansible playbooks (4 hours)
3. Restore DB from latest backup (2-4 hours)
4. Restore files from NAS/offsite (4-8 hours)

---

## 16. Facility Requirements

Minimal — we're only drawing 6.5 kW across 3 racks:

| # | Requirement | Specification |
|---|-------------|--------------|
| 1 | Rack positions | 3 racks (option for 6 if expanding) |
| 2 | Power per rack | 1× 16A 230V circuit per rack |
| 3 | Total power | 6.5 kW (trivial) |
| 4 | Cooling | 6.5 kW heat rejection |
| 5 | WAN | 1× fiber or Ethernet cross-connect to ISP |
| 6 | Internet | 100 Mbps minimum |
| 7 | Access | Badge access for 5-10 staff |
| 8 | Fire suppression | Clean agent over server area |
| 9 | Temperature | 18-27°C |

---

## 17. Implementation Timeline

Hardware installation only (app development timeline is separate):

```
Week:   1   2   3   4   5   6   7   8   9   10  11  12
        ├───────────────────────────────────────────────┤
Order   ├───────┤ Procure & Ship (Weeks 1-3)
Ship         ├───────────┤ Shipping & Customs (Weeks 2-5)
Install               ├───────┤ Rack, Cable, Power (Weeks 5-7)
Config                     ├───────┤ OS, DB, Network Config (Weeks 7-9)
Test                            ├───────┤ Burn-in & Load Test (Weeks 9-11)
Handover                              ├───┤ Documentation & Training (Weeks 11-12)
```

**12 weeks from purchase order to production-ready infrastructure.**

---

## 18. Risk Register

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | Server hardware failure | LOW | 3-year Dell ProSupport with onsite next-business-day; HA pair for every role; Dell has Nigeria offices |
| 2 | Import/customs delay | MEDIUM | Ship early; use military logistics; air freight |
| 3 | pfSense inadequate | LOW | 18 Gbps capacity vs <1 Gbps actual traffic = 18× headroom |
| 4 | MikroTik switch failure | HIGH | Second switch on hot standby; MTBF >100K hours |
| 5 | NAS drive failure | LOW | SHR-2 survives 2 simultaneous failures; 2 shelf spares |
| 6 | No DR site (total loss scenario) | CRITICAL | Hourly WAL + daily pg_dump + monthly offsite. Worst case: 24hr data loss + 2-week rebuild |
| 7 | Forex fluctuation | LOW | All hardware purchased in USD; total is small enough to absorb 10-15% swing |

---

## Appendix: Version Comparison

| | V3 (35 servers) | V4 (8 servers) | V6 (4 refurb) | **V7 (This)** |
|--|--|--|--|--|
| Scope | Full build | Full build | Infra only | **Infra only** |
| Servers | 35 new premium | 8 new premium | 4 refurb | **4 NEW Dell R760xs** |
| Server Cost | $591K | $198K | $24.6K | **$68K** |
| Storage | Dell SAN $627K | Dell SAN $627K | Synology $6.7K | **Synology $6.7K** |
| Network | Cisco $171K | Cisco $168K | MikroTik $1.2K | **MikroTik $1.2K** |
| Firewalls | Palo Alto $160K | Palo Alto $160K | pfSense $2K | **pfSense $2K** |
| Warranty | 3yr Dell | 3yr Dell | 1yr third-party | **3yr Dell ProSupport** |
| Power Draw | 52.7 kW | 28 kW | 6.5 kW | **6.5 kW** |
| Racks | 14 | 10 | 3 | **3** |
| App Development | $1.05M | $1.05M | Not included | **Not included** |
| **Total** | **$4,320,635** | **$3,580,632** | **$83,936** | **$135,983** |

---

*Version 7.0 — Infrastructure and hardware only. New servers (not refurbished). Application development excluded.*

*Server pricing based on Dell configurator, ServerMall, and reseller estimates (Q1 2026). Alternative vendors: [HPE DL380 Gen11](https://buy.hpe.com/us/en/compute/rack-servers/proliant-dl300-servers/hpe-proliant-dl380-gen11/p/1014696069), [Lenovo SR650 V3](https://www.lenovo.com/us/en/p/servers-storage/servers/racks/thinksystem-sr650-v3/len21ts0013), [Supermicro 2U](https://store.supermicro.com/us_en/systems/rackmount/rackmount-2u/2u-dp-rack-servers.html). Network: [MikroTik](https://mikrotik.com), [Netgate](https://shop.netgate.com). Storage: [Synology](https://www.synology.com), [Newegg drives](https://www.newegg.com). Import duties: [US trade.gov Nigeria guide](https://www.trade.gov/country-commercial-guides/nigeria-import-tariffs).*
