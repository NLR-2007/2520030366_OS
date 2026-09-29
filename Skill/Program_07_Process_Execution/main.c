#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <stdlib.h>


int main()
{

char command[100];


printf("OSSP-Shell> ");

scanf("%s",command);


pid_t pid=fork();


if(pid==0)
{

execlp(command,command,NULL);


printf("Command not found\n");

exit(1);

}

else
{

wait(NULL);

printf("Command completed\n");

}


return 0;

}
