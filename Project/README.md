# 🚀 Operating Systems Major Project - BlackPanther OS 🐾

> **Student & Project Info:**  
> **Student:** Nimma Lokesh Reddy | **ID:** 2520030366 | **Section:** S-06 | **Batch:** 20  
> **Course:** Operating Systems & Systems Programming (OSSP S6)  
> **Project Repository:** [https://github.com/NLR-2007/BlackPanther_OSSP_S6](https://github.com/NLR-2007/BlackPanther_OSSP_S6)

---

## 📌 Project Overview

**BlackPanther OS** is a 32-bit x86 Preemptive Multitasking Operating System Kernel written from scratch in C and x86 Assembly. Designed for academic research, system efficiency, and low-level kernel development.

### 🌟 Key Kernel Subsystems
- **Multiboot Handoff:** Bootable via GRUB / QEMU into 32-bit Protected Mode.
- **GDT & IDT Setup:** Global Descriptor Table and Interrupt Descriptor Table with 32 ISRs and 16 IRQs.
- **Physical Memory Manager (PMM):** Bitmap frame allocator.
- **Virtual Memory Manager (VMM):** 2-level paging engine (Page Directory & Page Tables).
- **Kernel Heap Allocator:** Custom `kmalloc` and `kfree` pool allocator.
- **Preemptive Round-Robin Scheduler:** Context switching driven by PIT 8254 timer (100Hz).
- **Virtual File System (VFS) & Initrd:** RAMDisk driver and unified VFS interface.
- **Interactive Shell:** BlackPanther CLI with VGA 80x25 text mode driver and PS/2 keyboard ring buffer.

---

## 🔗 Official GitHub Repository Link

Access the complete source code, Makefile build system, and architecture documentation at:

👉 [**https://github.com/NLR-2007/BlackPanther_OSSP_S6**](https://github.com/NLR-2007/BlackPanther_OSSP_S6)
