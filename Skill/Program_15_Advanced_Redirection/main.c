#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>


int main()
{


int fd;


fd=open("log.txt",
O_WRONLY|O_CREAT|O_APPEND,
0644);



dup2(fd,STDOUT_FILENO);


close(fd);



printf("New log entry\n");



int errorfd;


errorfd=open("error.txt",
O_WRONLY|O_CREAT|O_TRUNC,
0644);



dup2(errorfd,STDERR_FILENO);



close(errorfd);



fprintf(stderr,
"Sample error message\n");



return 0;

}
