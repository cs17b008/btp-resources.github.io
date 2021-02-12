#!/usr/bin/perl
require FindBin;
require "$FindBin::Bin/globalvariables.pl";
require "$FindBin::Bin/logfile_helper.pl";

##############################
# Get STDIN:
$stdin = <STDIN>;

# Remove ^M from stdin:
#$stdin =~ s/'\t'/''/g;
$stdin =~ tr/\t//d;
$stdin =~ tr/\r//d;

##############################
# Get the timestamp:
$datestr2 = &GetTimeStamp;

##############################
# Get host information and IP address:
# $addr = $ENV{'REMOTE_ADDR'};

##############################
# Write to logfile:
open(FP,">>", "$LM_HOME/AnnotationCache/Logs/logfile.txt");
print FP "\n$datestr2 $stdin";
close(FP);

# print "\n$addr $stdin $std";
# print "Content-type: text/xml\n\n" ;
# print "<nop/>\n";
