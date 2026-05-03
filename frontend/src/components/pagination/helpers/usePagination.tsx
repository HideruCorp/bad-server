import { AsyncThunk } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from '@store/hooks'
import { RootState } from '@store/store'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

interface PaginationResult<_, U> {
    data: U[]
    totalPages: number
    currentPage: number
    limit: number
    nextPage: () => void
    prevPage: () => void
    setPage: (page: number) => void
    setLimit: (limit: number) => void
}

const usePagination = <T, U>(
    asyncAction: AsyncThunk<T, Record<string, unknown>, Record<string, unknown>>,
    selector: (state: RootState) => U[],
    defaultLimit: number
): PaginationResult<T, U> => {
    const dispatch = useDispatch()
    const data = useSelector(selector)
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalPages, setTotalPages] = useState<number>(1)

    const currentPage = Math.min(
        Number(searchParams.get('page')) || 1,
        totalPages
    )

    const limit = Number(searchParams.get('limit')) || defaultLimit

    const updateURL = useCallback(
        (newParams: Record<string, unknown>) => {
            const updatedParams = new URLSearchParams(searchParams)
            Object.entries(newParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    updatedParams.set(key, value.toString())
                } else {
                    updatedParams.delete(key)
                }
            })
            setSearchParams(updatedParams)
        },
        [searchParams, setSearchParams]
    )

    const fetchData = useCallback(
        async (params: Record<string, unknown>) => {
            const response = await dispatch(asyncAction(params))
            const payload = response as {
                payload: { pagination: { totalPages: number } }
            }
            setTotalPages(payload.payload.pagination.totalPages)
        },
        [dispatch, asyncAction]
    )

    const setPage = useCallback(
        (page: number) => {
            const newPage = Math.max(1, Math.min(page, totalPages))
            updateURL({ page: newPage, limit })
        },
        [totalPages, limit, updateURL]
    )

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries())
        fetchData({ ...params, page: currentPage, limit })
    }, [currentPage, limit, searchParams, fetchData])

    useEffect(() => {
        if (data.length === 0 && currentPage > 1) {
            setPage(1)
        }
    }, [data.length, currentPage, setPage])

    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            updateURL({ page: currentPage + 1, limit })
        }
    }, [currentPage, totalPages, limit, updateURL])

    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            updateURL({ page: currentPage - 1, limit })
        }
    }, [currentPage, limit, updateURL])

    const setLimit = useCallback(
        (newLimit: number) => {
            updateURL({ page: 1, limit: newLimit })
        },
        [updateURL]
    )

    return {
        data,
        totalPages,
        currentPage,
        limit,
        nextPage,
        prevPage,
        setPage,
        setLimit,
    }
}

export default usePagination
