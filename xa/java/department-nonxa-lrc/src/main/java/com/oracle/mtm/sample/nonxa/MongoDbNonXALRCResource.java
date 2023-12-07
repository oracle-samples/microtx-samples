/*
Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data
(collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the
Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell,
offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be
included in all copies or substantial portions of the Software. **

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
package com.oracle.mtm.sample.nonxa;

import com.mongodb.client.ClientSession;
import com.oracle.mtm.sample.Configuration;
import com.oracle.mtm.sample.MongoDbClientSession;
import oracle.tmm.jta.nonxa.NonXAException;
import oracle.tmm.jta.nonxa.NonXAResource;

import jakarta.inject.Inject;
import jakarta.inject.Provider;
import javax.transaction.xa.Xid;
import java.util.List;


public class MongoDbNonXALRCResource implements NonXAResource {

    @Inject
    @MongoDbClientSession
    private Provider<ClientSession> clientSessionProvider;

    @Inject
    Configuration config;

    private ClientSession session;

    public MongoDbNonXALRCResource()  {
    }

    @Override
    public void begin(Xid xid) throws NonXAException {
        session = clientSessionProvider.get();
        if (session == null) {
            throw new NonXAException("Client session instance is null");
        }
        if (!session.hasActiveTransaction()) {
            session.startTransaction();
        }
    }

    @Override
    public void commit(Xid xid, byte[] bytes) throws NonXAException {
        try {
            // commit records will be empty for LRC (Last Resource Committer) branch. Hence skipping save commit records step
            session.commitTransaction();
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
        throw new NonXAException("Recovery is not supported for the LRC branch");
    }

    @Override
    public boolean isSameRM(NonXAResource nonXAResource) throws NonXAException {
        return false;
    }
}