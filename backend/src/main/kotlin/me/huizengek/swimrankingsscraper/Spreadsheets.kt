package me.huizengek.swimrankingsscraper

import org.apache.poi.xssf.usermodel.XSSFCell
import org.apache.poi.xssf.usermodel.XSSFRow
import org.apache.poi.xssf.usermodel.XSSFSheet
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import java.io.ByteArrayOutputStream

fun buildSpreadsheet(name: String, block: SpreadSheetScope.() -> Unit) =
    SpreadSheetScope(name).apply(block).build()

class SpreadSheetScope(name: String) {
    private val spreadsheet = XSSFWorkbook()
    private val page = spreadsheet.createSheet(name).apply {
        defaultColumnWidth *= 2
    }

    val sheet get() = this

    fun put(x: Int, y: Int, value: String): XSSFCell = page.rowAt(y).cellAt(x).apply {
        setCellValue(value)
    }

    fun putFormula(x: Int, y: Int, formula: String) {
        page.rowAt(y).cellAt(x).cellFormula = formula
    }

    fun setColWidth(col: Int, width: Int) = page.setColumnWidth(col, width * 256)

    fun setRowHeight(row: Int, height: Short) {
        page.rowAt(row).height = height
    }

    fun build(): ByteArray = ByteArrayOutputStream().use {
        spreadsheet.write(it)
        it.toByteArray()
    }

    @JvmInline
    value class XMarker(private val x: Int) {
        context(SpreadSheetScope)
        operator fun set(y: Int, value: String) = put(x, y, value)
    }
    operator fun get(x: Int) = XMarker(x)
}

private fun XSSFSheet.rowAt(index: Int) = runCatching { getRow(index) }.getOrNull() ?: createRow(index)
private fun XSSFRow.cellAt(index: Int) = runCatching { getCell(index) }.getOrNull() ?: createCell(index)