package com.oracle.mtm.sample.mappers.nonxa;

import com.oracle.mtm.sample.entity.Fee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface FeeMapperXA {

    @Select("SELECT * FROM fee WHERE account_id = #{account_id}")
    Fee findByAccountId(@Param("account_id") String account_id);

    @Update("UPDATE fee SET amount = amount + #{amount} WHERE account_id = #{accountId}")
    int depositFee(@Param("accountId") String accountId, @Param("amount") double amount);
}