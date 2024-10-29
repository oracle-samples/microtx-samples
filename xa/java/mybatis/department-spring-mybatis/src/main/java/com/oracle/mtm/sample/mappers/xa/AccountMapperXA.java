package com.oracle.mtm.sample.mappers.xa;

import com.oracle.mtm.sample.entity.Account;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface AccountMapperXA {

    @Select("SELECT * FROM accounts WHERE account_id = #{account_id}")
    Account findByAccountId(@Param("account_id") String account_id);

    @Update("UPDATE accounts SET amount = amount - #{amount} WHERE account_id = #{accountId}")
    int withdrawAccountAmount(@Param("accountId") String accountId, @Param("amount") double amount);

    @Update("UPDATE accounts SET amount = amount - #{amount} WHERE account_id = #{accountId}")
    int depositAccountAmount(@Param("accountId") String accountId, @Param("amount") double amount);
}