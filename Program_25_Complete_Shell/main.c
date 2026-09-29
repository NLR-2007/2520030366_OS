#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>


int main()
{

char command[100];


while(1)
{


printf("OSSP-Shell> ");


fgets(command,100,stdin);


command[strlen(command)-1]='\0';



if(strcmp(command,"exit")==0)
{

printf("Shell closed\n");

break;

}



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


}



}


return 0;

}
