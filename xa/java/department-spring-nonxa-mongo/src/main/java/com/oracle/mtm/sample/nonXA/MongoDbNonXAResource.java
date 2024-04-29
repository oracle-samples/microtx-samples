/*

Oracle Transaction Manager for Microservices

Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data (collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be included in all copies or substantial portions of the Software. **
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
package com.oracle.mtm.sample.nonXA;

import com.mongodb.MongoClientSettings;
import com.mongodb.client.ClientSession;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.oracle.microtx.springboot.MicroTxClientMain;

import com.oracle.mtm.sample.NonXADataSourceConfig;
import com.oracle.mtm.sample.entity.CommitRecord;

import oracle.tmm.jta.nonxa.NonXAException;
import oracle.tmm.jta.nonxa.NonXAResource;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.xa.Xid;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

@Service
public class MongoDbNonXAResource implements NonXAResource {

    private long LLR_DELETE_COMMIT_RECORD_TIME_INTERVAL;
    @Autowired
    ClientSession clientSessionProvider;

    @Autowired
    NonXADataSourceConfig config;

    @Autowired
    MongoDbNonXAResource(MicroTxClientMain microTxClientMain){
        LLR_DELETE_COMMIT_RECORD_TIME_INTERVAL = microTxClientMain.xaLlrDeleteCommitRecordInterval();
    }


    private ClientSession session;

    private static long timer = 0;
    private static ExecutorService executor = Executors.newFixedThreadPool(2);

    public MongoDbNonXAResource()  {
    }


    @Override
    public void begin(Xid xid) throws NonXAException {
       try{
        session = clientSessionProvider;
        if (session == null) {
            throw new NonXAException("Client session instance is null");
        }
        if (!session.hasActiveTransaction()) {
            session.startTransaction();
        }}catch (NonXAException e){
           throw e;
       }
    }

    @Override
    public void commit(Xid xid, byte[] bytes) throws NonXAException {
        try {
            setCommitRecord(new String(xid.getGlobalTransactionId()), bytes);
            session.commitTransaction();
            if (System.currentTimeMillis() - timer > LLR_DELETE_COMMIT_RECORD_TIME_INTERVAL) {
                long currentTime = System.currentTimeMillis();
                LinkedList<String> expiredGtrids = new LinkedList<>();

                // getting all the previous commit record older than the timer

                Iterator<CommitRecord> it = LlrCommitRecords.InMemoryCommitRecordList.listIterator();
                while(it.hasNext())
                {
                    CommitRecord currentRecord = it.next();
                    if(Timestamp.valueOf(currentRecord.getTimeStamp()).getTime()<=timer){
                        expiredGtrids.add(currentRecord.getGtrid());
                        it.remove();
                    }
                }
                if(expiredGtrids.size() > 0)
                {
                    Runnable asyncDelete =  new AsyncLLRCommitRecordDeletion(getCommitRecordsCollection(), expiredGtrids);
                    executor.execute(asyncDelete);
                }
                timer = currentTime;
            }
        } catch (Exception e) {
            if(session.hasActiveTransaction()) {
                session.abortTransaction();
            }
            throw new NonXAException(e.getMessage());
        } finally {
            if (session != null) {
                session.close();
            }
        }
    }

    @Override
    public void rollback(Xid xid) throws NonXAException {
        try {
            session.abortTransaction();
        } catch (Exception e) {
            throw new NonXAException(e.getMessage());
        } finally {
            if (session != null) {
                session.close();
            }
        }
    }

    @Override
    public List<byte[]> recover() throws NonXAException {
        List<byte[]> commitRecords;
        try {
            commitRecords = getNonExpiredCommitRecords();
        } catch (Exception e) {
            throw new NonXAException(e.getMessage());
        } finally {
            if (session != null) {
                session.close();
            }
        }
        return commitRecords;
    }

    @Override
    public boolean isSameRM(NonXAResource nonXAResource) throws NonXAException {
        return false;
    }

    public void setCommitRecord(String gtrid, byte[] commitRecord) {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        CommitRecord record = new CommitRecord();
        record.setGtrid(gtrid);
        record.setCommitRecord(commitRecord);
        record.setTimeStamp(timestamp.toString());
        LlrCommitRecords.InMemoryCommitRecordList.add(record);
        getCommitRecordsCollection().insertOne(session, record);
    }



    public List<byte[]> getNonExpiredCommitRecords() {
        FindIterable<CommitRecord> commitRecords = getCommitRecordsCollection().find();
        MongoCursor<CommitRecord> iterator = commitRecords.iterator();
        long currentTime = System.currentTimeMillis();
        List<byte[]> result = new ArrayList<>();
        CommitRecord currentRecord = new CommitRecord();
        LinkedList<String> expiredGtrids = new LinkedList<>();

        while(iterator.hasNext()) {
            currentRecord = iterator.next();
            Timestamp timestamp = Timestamp.valueOf(currentRecord.getTimeStamp());
            if(currentTime-timestamp.getTime() > LLR_DELETE_COMMIT_RECORD_TIME_INTERVAL) {
                expiredGtrids.add(currentRecord.getGtrid());
            } else {
                result.add(currentRecord.getCommitRecord());
            }
            if(expiredGtrids.size() > 0){
                Runnable asyncDelete =  new AsyncLLRCommitRecordDeletion(getCommitRecordsCollection(), expiredGtrids);
                executor.execute(asyncDelete);
            }
        }
        return result;
    }

    private MongoCollection<CommitRecord> getCommitRecordsCollection() {
        CodecRegistry pojoCodecRegistry = fromRegistries(MongoClientSettings.getDefaultCodecRegistry(),
                fromProviders(PojoCodecProvider.builder().register(CommitRecord.class).build()));
        return config.getDatabase().getCollection("commitRecords", CommitRecord.class).withCodecRegistry(pojoCodecRegistry);
    }
}
