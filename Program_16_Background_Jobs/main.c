#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/wait.h>


int main()
{

char command[50];


printf("OSSP-Shell> ");

scanf("%s",command);


pid_t pid=fork();



if(pid==0)
{

printf("Running background process PID: %d\n",
getpid());


execlp(command,command,NULL);

exit(1);

}


else
{

printf("Shell returned immediately\n");

}


return 0;

}
