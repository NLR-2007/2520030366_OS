#include <stdio.h>
#include <string.h>


int main()
{

char input[200];


printf("Enter command:");

fgets(input,200,stdin);


if(input[0]=='\'')
{

printf("Quoted string detected\n");

}


printf("Command: %s",input);


return 0;

}
