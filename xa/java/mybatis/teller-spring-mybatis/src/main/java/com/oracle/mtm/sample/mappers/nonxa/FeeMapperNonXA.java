package com.oracle.mtm.sample.mappers.nonxa;

import com.oracle.mtm.sample.entity.Fee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface FeeMapperNonXA {

    @Select("SELECT * FROM fee WHERE account_id = #{account_id}")
    Fee findByAccountId(@Param("account_id") String account_id);
}