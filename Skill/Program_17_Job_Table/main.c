#include <stdio.h>


struct Job
{

int id;

int pid;

char status[20];

};


int main()
{


struct Job jobs[5];


jobs[0].id=1;

jobs[0].pid=1234;

sprintf(jobs[0].status,"Running");



printf("Job List\n");

printf("ID PID STATUS\n");


for(int i=0;i<1;i++)
{

printf("%d %d %s\n",
jobs[i].id,
jobs[i].pid,
jobs[i].status);

}



return 0;

}
