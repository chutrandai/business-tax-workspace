# Utility / Static Method Test Template

Dùng cho: Utility classes, static methods, pure functions (không có Spring dependencies).

## Template cơ bản — JUnit 5 thuần (không cần Spring)

```java
package com.example.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

class TextUtilsTest {

    @Test
    @DisplayName("normalizeText: loại bỏ dấu và chuyển thường")
    void shouldNormalizeVietnameseText() {
        String input = "Điện thoại Samsung";
        String expected = "dien thoai samsung";

        String result = TextUtils.normalizeText(input);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    @DisplayName("normalizeText: xử lý null → trả về empty string")
    void shouldReturnEmptyStringForNull() {
        String result = TextUtils.normalizeText(null);
        assertThat(result).isEmpty();
    }

    @ParameterizedTest(name = "Input: ''{0}'' → Expected: ''{1}''")
    @CsvSource({
        "Hello World, hello world",
        "UPPER CASE, upper case",
        "Tiếng Việt, tieng viet",
        "  spaces  , spaces",
        "'', ''"
    })
    void shouldNormalizeVariousInputs(String input, String expected) {
        assertThat(TextUtils.normalizeText(input)).isEqualTo(expected);
    }

    @ParameterizedTest
    @NullAndEmptySource                 // Test cả null và ""
    void shouldHandleNullAndEmpty(String input) {
        String result = TextUtils.normalizeText(input);
        assertThat(result).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"abc", "test-123", "Hello_World"})
    void shouldAlwaysReturnLowercase(String input) {
        String result = TextUtils.normalizeText(input);
        assertThat(result).isEqualTo(result.toLowerCase());
    }
}
```

## Test Similarity / Math functions

```java
class SimilarityCalculatorTest {

    @Test
    void shouldReturn1ForIdenticalStrings() {
        double result = SimilarityCalculator.levenshteinSimilarity("hello", "hello");
        assertThat(result).isEqualTo(1.0);
    }

    @Test
    void shouldReturn0ForCompletelyDifferentStrings() {
        double result = SimilarityCalculator.levenshteinSimilarity("abc", "xyz");
        assertThat(result).isCloseTo(0.0, within(0.01));
    }

    @Test
    void shouldReturnValueBetween0And1() {
        double result = SimilarityCalculator.levenshteinSimilarity("kitten", "sitting");
        assertThat(result).isBetween(0.0, 1.0);
    }

    @ParameterizedTest
    @CsvSource({
        "hello, hello, 1.0",
        "abc, abc, 1.0",
        "kitten, sitting, 0.57"
    })
    void shouldCalculateLevenshtein(String s1, String s2, double expected) {
        double result = SimilarityCalculator.levenshteinSimilarity(s1, s2);
        assertThat(result).isCloseTo(expected, within(0.01));
    }
}
```

## Test Exception & Edge Cases

```java
class ValidationUtilsTest {

    @Test
    void shouldThrowWhenBothStringsEmpty() {
        assertThatThrownBy(() -> SimilarityCalculator.calculate("", ""))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Both strings cannot be empty");
    }

    @Test
    void shouldThrowNPEWhenNull() {
        assertThatThrownBy(() -> TextUtils.normalizeText(null))
            .isInstanceOf(NullPointerException.class);
        // hoặc nếu expected return empty:
        // assertThat(TextUtils.normalizeText(null)).isEmpty();
    }

    @Test
    void shouldNotThrowForValidInput() {
        assertThatCode(() -> Validator.validate("valid@email.com"))
            .doesNotThrowAnyException();
    }
}
```

## Test Collections và List operations

```java
class CollectionUtilsTest {

    @Test
    void shouldPartitionListCorrectly() {
        List<Integer> input = List.of(1, 2, 3, 4, 5, 6, 7);
        
        List<List<Integer>> result = CollectionUtils.partition(input, 3);
        
        assertThat(result).hasSize(3);
        assertThat(result.get(0)).containsExactly(1, 2, 3);
        assertThat(result.get(1)).containsExactly(4, 5, 6);
        assertThat(result.get(2)).containsExactly(7);
    }

    @Test
    void shouldReturnEmptyListForEmptyInput() {
        List<List<Integer>> result = CollectionUtils.partition(List.of(), 5);
        assertThat(result).isEmpty();
    }
}
```

## Test với thời gian (Clock / LocalDate)

```java
class DateUtilsTest {

    @Test
    void shouldFormatDateCorrectly() {
        LocalDate date = LocalDate.of(2024, 1, 15);
        String result = DateUtils.formatDate(date, "yyyy-MM-dd");
        assertThat(result).isEqualTo("2024-01-15");
    }

    @Test
    void shouldDetectWeekend() {
        LocalDate saturday = LocalDate.of(2024, 1, 13);   // Thứ 7
        assertThat(DateUtils.isWeekend(saturday)).isTrue();
        
        LocalDate monday = LocalDate.of(2024, 1, 15);     // Thứ 2
        assertThat(DateUtils.isWeekend(monday)).isFalse();
    }
}
```

## AssertJ cheat sheet

```java
// String assertions
assertThat(result).isEqualTo("expected");
assertThat(result).contains("substring");
assertThat(result).startsWith("prefix");
assertThat(result).matches("regex.*pattern");
assertThat(result).isBlank();
assertThat(result).isNotBlank();
assertThat(result).isEmpty();

// Number assertions
assertThat(result).isEqualTo(42);
assertThat(result).isGreaterThan(0);
assertThat(result).isLessThanOrEqualTo(100);
assertThat(result).isBetween(0.0, 1.0);
assertThat(result).isCloseTo(0.75, within(0.01));  // Floating point

// Collection assertions
assertThat(list).hasSize(3);
assertThat(list).contains("item1", "item2");
assertThat(list).containsExactly("a", "b", "c");   // Exact order
assertThat(list).containsExactlyInAnyOrder("c", "a", "b");
assertThat(list).allMatch(s -> s.length() > 0);
assertThat(list).anyMatch(s -> s.startsWith("A"));
assertThat(list).isEmpty();
assertThat(list).isNotEmpty();

// Object assertions
assertThat(obj).isNotNull();
assertThat(obj).isNull();
assertThat(obj).isInstanceOf(UserDto.class);

// Exception assertions
assertThatThrownBy(() -> method())
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessage("error message")
    .hasMessageContaining("partial message");

assertThatCode(() -> safeMethod()).doesNotThrowAnyException();
```
