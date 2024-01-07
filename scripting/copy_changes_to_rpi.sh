#!/bin/bash

BASE_DIR=/Users/matthiasfuchs/Projects/schwimmen/datamapping
TEMP_DIR=/tmp
REMOTE_TMP=/tmp
APP_NAME="datamapping"
DATAMAPPING_DIR=/opt/datamapping/base

#REMOTE_SERVER_NAME=jetson.fritz.box
#REMOTE_SERVER_USER=jetson
#SHARE_FOLDER_NAME=splash

REMOTE_SERVER_NAME=rockpi-4b.fritz.box
#REMOTE_SERVER_NAME=192.168.178.154
REMOTE_SERVER_USER=rock

echo "Connect:                        $REMOTE_SERVER_USER@$REMOTE_SERVER_NAME"
read -p "Go on (y/n)? " answer
case ${answer:0:1} in
    y|Y )
        echo ...
    ;;
    * )
        exit 0
    ;;
esac

cd $BASE_DIR

function exec_remote(){
    echo "exec $1"
    ssh ${REMOTE_SERVER_USER}@${REMOTE_SERVER_NAME} $1
}

tar -czf $TEMP_DIR/${APP_NAME}.tar.gz data/* incoming/*
scp $TEMP_DIR/${APP_NAME}.tar.gz ${REMOTE_SERVER_USER}@${REMOTE_SERVER_NAME}:${REMOTE_TMP}
rm $TEMP_DIR/${APP_NAME}.tar.gz

# exec_remote "sudo ls ${REMOTE_TMP}/${APP_NAME}.tar.gz"
exec_remote "sudo tar -xzf ${REMOTE_TMP}/${APP_NAME}.tar.gz -C ${DATAMAPPING_DIR}"
exec_remote "sudo rm ${REMOTE_TMP}/${APP_NAME}.tar.gz"

# pm2 stop map2local
exec_remote "pm2 stop map2local > /dev/null"
exec_remote "pm2 start map2local > /dev/null"
sleep 2
exec_remote "pm2 status map2local "

echo "copy to shared dir ${DATAMAPPING_DIR}"
