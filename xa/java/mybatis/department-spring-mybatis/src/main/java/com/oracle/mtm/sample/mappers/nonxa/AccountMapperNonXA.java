package com.oracle.mtm.sample.mappers.nonxa;

import com.oracle.mtm.sample.entity.Account;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AccountMapperNonXA {

    @Select("SELECT * FROM accounts WHERE account_id = #{account_id}")
    Account findByAccountId(@Param("account_id") String account_id);
}