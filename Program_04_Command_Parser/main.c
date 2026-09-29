#include <stdio.h>
#include <string.h>


int main()
{

char input[200];

char *token;


printf("Enter command: ");

fgets(input,200,stdin);


token=strtok(input," ");


while(token!=NULL)
{

printf("Token: %s\n",token);

token=strtok(NULL," ");

}


return 0;

}
