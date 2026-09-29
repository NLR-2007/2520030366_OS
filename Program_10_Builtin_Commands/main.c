#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>


int main()
{

char command[100];


while(1)
{

printf("OSSP-Shell> ");

scanf("%s",command);



if(strcmp(command,"exit")==0)
{
break;
}



else if(strcmp(command,"pwd")==0)
{

char cwd[200];

getcwd(cwd,sizeof(cwd));

printf("%s\n",cwd);

}



else if(strcmp(command,"cd")==0)
{

char path[100];

scanf("%s",path);


if(chdir(path)!=0)
{
printf("Directory error\n");
}

}



else
{

printf("Unknown command\n");

}


}


return 0;

}
