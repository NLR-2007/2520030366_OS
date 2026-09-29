#include <stdio.h>
#include <stdlib.h>
#include <string.h>


int main()
{

char *path=getenv("PATH");


printf("System PATH:\n");

printf("%s\n",path);


char *token=strtok(path,":");


while(token!=NULL)
{

printf("Directory: %s\n",token);


token=strtok(NULL,":");

}


return 0;

}
