# 🎯 Operating Systems - Skill Development Tasks Folder

> **Student Details:** Nimma Lokesh Reddy | **ID:** 2520030366 | **Section:** S-06 | **Batch:** 20  
> **Course:** Operating Systems & Systems Programming (OSSP)  
> **OS Repository:** [https://github.com/NLR-2007/2520030366_OS](https://github.com/NLR-2007/2520030366_OS)

---

## 📌 Skill Development Tasks Catalog

This folder contains skill building tasks, system programming practice scripts, and low-level OS data structure implementations:

| Skill Task File | Skill Focus & Description | Execution Command |
| :--- | :--- | :--- |
| [**skill01_custom_shell_scripting.sh**](./skill01_custom_shell_scripting.sh) | Shell Automation: Systems inspection, CPU & RAM monitoring script | `bash skill01_custom_shell_scripting.sh` |
| [**skill02_posix_multithreading_matrix.c**](./skill02_posix_multithreading_matrix.c) | Multithreading: POSIX Pthreads parallel matrix multiplication | `gcc skill02_posix_multithreading_matrix.c -pthread -o skill02` |
| [**skill03_readers_writers_mutex.c**](./skill03_readers_writers_mutex.c) | Synchronization: Readers-Writers problem with Mutex locks | `gcc skill03_readers_writers_mutex.c -pthread -o skill03` |
| [**skill04_dining_philosophers_problem.c**](./skill04_dining_philosophers_problem.c) | Deadlock Avoidance: Dining Philosophers synchronization | `gcc skill04_dining_philosophers_problem.c -pthread -o skill04` |
| [**skill05_lru_cache_simulator.c**](./skill05_lru_cache_simulator.c) | Kernel Data Structures: LRU Page Cache with Hash Table & Doubly Linked List | `gcc skill05_lru_cache_simulator.c -o skill05` |
| [**skill06_custom_malloc_free_allocator.c**](./skill06_custom_malloc_free_allocator.c) | Low-Level Memory Management: Custom heap allocator (`my_malloc` & `my_free`) | `gcc skill06_custom_malloc_free_allocator.c -o skill06` |

---

## 💻 How to Run Skill Tasks

To run shell automation scripts:
```bash
chmod +x skill01_custom_shell_scripting.sh
./skill01_custom_shell_scripting.sh
```

To compile C multithreaded / system programming tasks:
```bash
gcc skill02_posix_multithreading_matrix.c -pthread -o skill02
./skill02
```
