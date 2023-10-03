#!/bin/bash
REDIS_HOST=$1
REDIS_PORT=$2
CLIENTS=$3
SHARDS=$4
RANDOMIZE=$5
REQUESTS=$(expr 10 \* ${SHARDS} \* ${RANDOMIZE})
ORIGINAL=$6
THREADS=$7
PIPELINE=$8
PAYLOAD=$(expr ${ORIGINAL})

stdbuf -o0 redis6-benchmark -h ${REDIS_HOST} -p ${REDIS_PORT}  -c ${CLIENTS} -n ${REQUESTS} -r ${RANDOMIZE} -d ${PAYLOAD} -P ${PIPELINE} -t get,set -q --csv -l --cluster