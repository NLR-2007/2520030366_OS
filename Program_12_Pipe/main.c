#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>


int main()
{

int pipefd[2];

pipe(pipefd);


pid_t pid=fork();



if(pid==0)
{

dup2(pipefd[1],STDOUT_FILENO);

close(pipefd[0]);


execlp("ls","ls",NULL);

}


else
{

wait(NULL);


dup2(pipefd[0],STDIN_FILENO);

close(pipefd[1]);


execlp("grep","grep",".c",NULL);

}


return 0;

}
